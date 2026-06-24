import { describe, it, expect } from 'vitest';
import { calcular } from './calculadora';
import {
  valorDe,
  valorDesconto,
  totais,
  type Rescisao,
  type ResultadoRescisao,
  type TipoVerba,
} from './tipos';

function detalheDe(resultado: ResultadoRescisao, tipo: TipoVerba) {
  return resultado.verbas.find((v) => v.tipo === tipo)?.detalhe;
}

describe('CalculadoraRescisao', () => {
  it('saldo de salário proporcional aos dias trabalhados no mês', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10), // 10/06/2026 -> 10 dias
      modalidade: 'SEM_JUSTA_CAUSA',
    };

    const resultado = calcular(rescisao);

    // 3000 / 30 * 10 = 1000.00
    expect(valorDe(resultado, 'SALDO_SALARIO')).toBe(1000);
  });

  it('13º proporcional conta avos com fração de 15 dias', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10), // junho tem 10 dias (<15)
      modalidade: 'SEM_JUSTA_CAUSA',
    };

    const resultado = calcular(rescisao);

    // jan-mai = 5 avos; junho nao conta. 3000/12*5 = 1250.00
    expect(valorDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')).toBe(1250);
  });

  it('13º proporcional conta a partir da admissão no mesmo ano', () => {
    const rescisao: Rescisao = {
      salarioMensal: 12000,
      dataAdmissao: new Date(2026, 5, 1), // 01/06/2026
      dataDesligamento: new Date(2026, 11, 20), // 20/12/2026
      modalidade: 'SEM_JUSTA_CAUSA',
    };

    const resultado = calcular(rescisao);

    // jun-dez = 7 avos (não conta jan-mai). 12000/12*7 = 7000.00
    expect(valorDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')).toBe(7000);
    expect(detalheDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')?.avos).toBe(7);
  });

  it('13º proporcional: mês de admissão com < 15 dias não conta', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2026, 2, 20), // 20/03 -> março tem 12 dias (<15)
      dataDesligamento: new Date(2026, 8, 10), // 10/09 -> setembro 10 dias (<15)
      modalidade: 'SEM_JUSTA_CAUSA',
    };

    const resultado = calcular(rescisao);

    // abr-ago = 5 avos. 3000/12*5 = 1250.00
    expect(detalheDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')?.avos).toBe(5);
    expect(valorDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')).toBe(1250);
  });

  it('regressão com TRCT real (Banco Pan, pedido de demissão)', () => {
    const rescisao: Rescisao = {
      salarioMensal: 15246.19,
      dataAdmissao: new Date(2021, 6, 13), // 13/07/2021
      dataDesligamento: new Date(2026, 1, 19), // 19/02/2026
      modalidade: 'PEDIDO_DEMISSAO',
      diasFeriasVencidas: 15,
    };

    const resultado = calcular(rescisao);

    // 13º: jan cheio + fev (dia 19 >= 15) = 2 avos -> 15246.19/12*2 = 2541.03
    expect(detalheDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')?.avos).toBe(2);
    expect(valorDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')).toBe(2541.03);

    // Férias proporcionais: aquisitivo 13/07/2025 -> 19/02/2026 = 7 avos
    const ferias = detalheDe(resultado, 'FERIAS_PROPORCIONAIS');
    expect(ferias?.avos).toBe(7);
    expect(ferias?.base).toBe(8893.61); // 15246.19/12*7
    expect(ferias?.terco).toBe(2964.54); // base/3

    // Férias vencidas: 15 dias + 1/3 -> 15246.19/30*15*4/3
    expect(valorDe(resultado, 'FERIAS_VENCIDAS')).toBe(10164.13);

    // Pedido de demissão: sem aviso indenizado e sem multa FGTS
    expect(valorDe(resultado, 'AVISO_PREVIO_INDENIZADO')).toBe(0);
    expect(valorDe(resultado, 'MULTA_FGTS')).toBe(0);
  });

  it('férias proporcionais contam avos do período aquisitivo atual + 1/3', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 2, 10), // admissão 10/03 -> período aquisitivo em 10/03
      dataDesligamento: new Date(2026, 5, 20), // 20/06/2026
      modalidade: 'PEDIDO_DEMISSAO',
    };

    const resultado = calcular(rescisao);

    // período 10/03 -> 20/06: 3 meses cheios (mar-abr-mai), junho 10 dias (<15).
    // 3000/12 * 3 * 4/3 = 1000.00
    expect(valorDe(resultado, 'FERIAS_PROPORCIONAIS')).toBe(1000);
  });

  it('férias vencidas: período cheio (30 dias) = salário + 1/3', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'PEDIDO_DEMISSAO',
      diasFeriasVencidas: 30,
    };

    const resultado = calcular(rescisao);

    // (3000/30)*30 * 4/3 = 4000.00
    expect(valorDe(resultado, 'FERIAS_VENCIDAS')).toBe(4000);
  });

  it('férias vencidas: saldo parcial de dias é proporcional', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'PEDIDO_DEMISSAO',
      diasFeriasVencidas: 10, // usou 20 dos 30 dias
    };

    const resultado = calcular(rescisao);

    // (3000/30)*10 * 4/3 = 1333.33
    expect(valorDe(resultado, 'FERIAS_VENCIDAS')).toBe(1333.33);
  });

  it('aviso prévio indenizado: 30 + 3 dias/ano e projeção de 13º/férias', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1), // 6 anos completos em 10/06/2026
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'SEM_JUSTA_CAUSA',
      tipoAvisoPrevio: 'INDENIZADO',
    };

    const resultado = calcular(rescisao);

    // 30 + 3*6 = 48 dias; 3000/30*48 = 4800.00
    expect(valorDe(resultado, 'AVISO_PREVIO_INDENIZADO')).toBe(4800);
    // projeta 10/06 + 48 dias = 28/07 -> 13º = 7 avos = 1750.00
    expect(valorDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')).toBe(1750);
    // férias proporcionais projetadas = 7 avos -> 3000/12*7*4/3 = 2333.33
    expect(valorDe(resultado, 'FERIAS_PROPORCIONAIS')).toBe(2333.33);
  });

  it('pedido de demissão: aviso não cumprido desconta os dias faltantes', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'PEDIDO_DEMISSAO',
      diasAvisoTrabalhados: 10, // devia 30, faltam 20
    };

    const resultado = calcular(rescisao);

    // (30 - 10) * 3000/30 = 2000.00
    expect(valorDesconto(resultado, 'AVISO_PREVIO_NAO_CUMPRIDO')).toBe(2000);
  });

  it('pedido de demissão: empregador dispensou o aviso, sem desconto', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'PEDIDO_DEMISSAO',
      diasAvisoTrabalhados: 0,
      empregadorDispensouAviso: true,
    };

    expect(valorDesconto(calcular(rescisao), 'AVISO_PREVIO_NAO_CUMPRIDO')).toBe(0);
  });

  it('pedido de demissão: sem informar dias, assume aviso cumprido (sem desconto)', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'PEDIDO_DEMISSAO',
    };

    expect(valorDesconto(calcular(rescisao), 'AVISO_PREVIO_NAO_CUMPRIDO')).toBe(0);
  });

  it('aviso não cumprido não se aplica fora do pedido de demissão', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'SEM_JUSTA_CAUSA',
      diasAvisoTrabalhados: 0,
    };

    expect(valorDesconto(calcular(rescisao), 'AVISO_PREVIO_NAO_CUMPRIDO')).toBe(0);
  });

  it('multa FGTS: 40% do saldo informado na dispensa sem justa causa', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'SEM_JUSTA_CAUSA',
      saldoFgts: 10000,
    };

    const resultado = calcular(rescisao);

    // 10000 * 40% = 4000.00
    expect(valorDe(resultado, 'MULTA_FGTS')).toBe(4000);
  });

  it('multa FGTS estimada (8% x salário x meses) quando saldo não informado', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2026, 0, 1),
      dataDesligamento: new Date(2026, 3, 10), // 3 meses (jan-mar), abril 10 dias <15
      modalidade: 'SEM_JUSTA_CAUSA',
    };

    const resultado = calcular(rescisao);

    // saldo estimado = 0.08*3000*3 = 720; multa 40% = 288.00
    expect(valorDe(resultado, 'MULTA_FGTS')).toBe(288);
  });

  it('justa causa: só saldo de salário e férias vencidas', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'JUSTA_CAUSA',
      diasFeriasVencidas: 30,
    };

    const resultado = calcular(rescisao);

    expect(valorDe(resultado, 'SALDO_SALARIO')).toBe(1000);
    expect(valorDe(resultado, 'FERIAS_VENCIDAS')).toBe(4000);
    expect(valorDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')).toBe(0);
    expect(valorDe(resultado, 'FERIAS_PROPORCIONAIS')).toBe(0);
    expect(valorDe(resultado, 'AVISO_PREVIO_INDENIZADO')).toBe(0);
    expect(valorDe(resultado, 'MULTA_FGTS')).toBe(0);
  });

  it('acordo mútuo: aviso prévio indenizado pela metade', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1), // 6 anos -> aviso cheio 48 dias
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'ACORDO_MUTUO',
      tipoAvisoPrevio: 'INDENIZADO',
    };

    const resultado = calcular(rescisao);

    // metade de 48 dias = 24; 3000/30*24 = 2400.00
    expect(valorDe(resultado, 'AVISO_PREVIO_INDENIZADO')).toBe(2400);
  });

  it('INSS sobre o saldo: faixa única quando salário <= 1ª faixa', () => {
    const rescisao: Rescisao = {
      salarioMensal: 1500,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 30), // mês cheio -> saldo 1500
      modalidade: 'JUSTA_CAUSA', // isola: sem 13º
    };

    const resultado = calcular(rescisao);

    // 1500 * 7,5% = 112.50
    expect(valorDesconto(resultado, 'INSS_SALARIO')).toBe(112.5);
  });

  it('INSS sobre o saldo: limitado ao teto (988,09) acima do teto', () => {
    const rescisao: Rescisao = {
      salarioMensal: 10000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 30),
      modalidade: 'JUSTA_CAUSA',
    };

    const resultado = calcular(rescisao);

    expect(valorDesconto(resultado, 'INSS_SALARIO')).toBe(988.09);
  });

  it('INSS sobre o 13º tem base própria', () => {
    const rescisao: Rescisao = {
      salarioMensal: 2000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 30), // 6 avos -> 13º = 1000
      modalidade: 'SEM_JUSTA_CAUSA',
    };

    const resultado = calcular(rescisao);

    // 13º = 1000 -> INSS = 1000 * 7,5% = 75.00
    expect(valorDesconto(resultado, 'INSS_DECIMO_TERCEIRO')).toBe(75);
  });

  it('IRRF: redutor zera o imposto para rendimento até 5.000', () => {
    const rescisao: Rescisao = {
      salarioMensal: 4000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 30), // saldo 4000
      modalidade: 'JUSTA_CAUSA',
    };

    const resultado = calcular(rescisao);

    expect(valorDesconto(resultado, 'IRRF_SALARIO')).toBe(0);
  });

  it('IRRF: redução parcial para rendimento entre 5.000 e 7.350', () => {
    const rescisao: Rescisao = {
      salarioMensal: 6000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 30), // saldo 6000
      modalidade: 'JUSTA_CAUSA',
    };

    const resultado = calcular(rescisao);

    // INSS 641.51; base 5358.49; tabela 27,5% -908,73 = 564.85;
    // redutor = 978,62 - 0,133145*6000 = 179.75; IRRF = 385.10
    expect(valorDesconto(resultado, 'IRRF_SALARIO')).toBe(385.1);
  });

  it('IRRF: dependentes aumentam a dedução e reduzem o imposto', () => {
    const rescisao: Rescisao = {
      salarioMensal: 6000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 30),
      modalidade: 'JUSTA_CAUSA',
      dependentes: 2,
    };

    const resultado = calcular(rescisao);

    // dedução 641.51 + 2*189.59 = 1020.69; base 4979.31;
    // tabela 460.58; redutor 179.75; IRRF = 280.83
    expect(valorDesconto(resultado, 'IRRF_SALARIO')).toBe(280.83);
  });

  it('IRRF do 13º tem base própria (redutor 0 acima de 7.350)', () => {
    const rescisao: Rescisao = {
      salarioMensal: 8000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 11, 30), // 12 avos -> 13º = 8000
      modalidade: 'SEM_JUSTA_CAUSA',
    };

    const resultado = calcular(rescisao);

    // INSS 921.51; base 7078.49; tabela 27,5% -908,73 = 1037.85; redutor 0
    expect(valorDesconto(resultado, 'IRRF_DECIMO_TERCEIRO')).toBe(1037.85);
  });

  it('totais: líquido = bruto - descontos', () => {
    const rescisao: Rescisao = {
      salarioMensal: 1500,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 30), // saldo 1500
      modalidade: 'JUSTA_CAUSA', // só saldo; INSS 112.50
    };

    const t = totais(calcular(rescisao));

    expect(t.bruto).toBe(1500);
    expect(t.descontos).toBe(112.5);
    expect(t.liquido).toBe(1387.5);
  });

  it('experiência: 13º e férias proporcionais, sem aviso nem multa', () => {
    const rescisao: Rescisao = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2026, 0, 1),
      dataDesligamento: new Date(2026, 5, 10),
      modalidade: 'EXPERIENCIA',
    };

    const resultado = calcular(rescisao);

    expect(valorDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')).toBe(1250);
    expect(valorDe(resultado, 'FERIAS_PROPORCIONAIS')).toBeGreaterThan(0);
    expect(valorDe(resultado, 'AVISO_PREVIO_INDENIZADO')).toBe(0);
    expect(valorDe(resultado, 'MULTA_FGTS')).toBe(0);
  });

  it('FGTS para saque por modalidade (à parte do total)', () => {
    const base = {
      salarioMensal: 3000,
      dataAdmissao: new Date(2020, 0, 1),
      dataDesligamento: new Date(2026, 5, 10),
      saldoFgts: 10000,
    };

    expect(calcular({ ...base, modalidade: 'SEM_JUSTA_CAUSA' }).fgtsSaque).toBe(10000);
    expect(calcular({ ...base, modalidade: 'ACORDO_MUTUO' }).fgtsSaque).toBe(8000);
    expect(calcular({ ...base, modalidade: 'EXPERIENCIA' }).fgtsSaque).toBe(10000);
    expect(calcular({ ...base, modalidade: 'PEDIDO_DEMISSAO' }).fgtsSaque).toBe(0);
    expect(calcular({ ...base, modalidade: 'JUSTA_CAUSA' }).fgtsSaque).toBe(0);
  });

  describe('memória de cálculo (detalhe das verbas)', () => {
    it('saldo de salário expõe os dias trabalhados no mês', () => {
      const resultado = calcular({
        salarioMensal: 3000,
        dataAdmissao: new Date(2020, 0, 1),
        dataDesligamento: new Date(2026, 5, 18), // 18/06
        modalidade: 'SEM_JUSTA_CAUSA',
      });

      expect(detalheDe(resultado, 'SALDO_SALARIO')?.dias).toBe(18);
    });

    it('13º proporcional expõe os avos', () => {
      const resultado = calcular({
        salarioMensal: 3000,
        dataAdmissao: new Date(2020, 0, 1),
        dataDesligamento: new Date(2026, 5, 20), // junho >=15 -> 6 avos
        modalidade: 'SEM_JUSTA_CAUSA',
      });

      expect(detalheDe(resultado, 'DECIMO_TERCEIRO_PROPORCIONAL')?.avos).toBe(6);
    });

    it('férias proporcionais expõem os avos (com projeção do aviso indenizado)', () => {
      const resultado = calcular({
        salarioMensal: 3000,
        dataAdmissao: new Date(2020, 0, 1),
        dataDesligamento: new Date(2026, 5, 10),
        modalidade: 'SEM_JUSTA_CAUSA',
        tipoAvisoPrevio: 'INDENIZADO', // projeta 10/06 + 48 dias = 28/07 -> 7 avos
      });

      expect(detalheDe(resultado, 'FERIAS_PROPORCIONAIS')?.avos).toBe(7);
    });

    it('férias vencidas expõem os dias não usufruídos', () => {
      const resultado = calcular({
        salarioMensal: 3000,
        dataAdmissao: new Date(2020, 0, 1),
        dataDesligamento: new Date(2026, 5, 10),
        modalidade: 'PEDIDO_DEMISSAO',
        diasFeriasVencidas: 10,
      });

      expect(detalheDe(resultado, 'FERIAS_VENCIDAS')?.dias).toBe(10);
    });

    it('férias proporcionais separam base e 1/3 constitucional (base + terço = valor)', () => {
      const resultado = calcular({
        salarioMensal: 3000,
        dataAdmissao: new Date(2020, 0, 1),
        dataDesligamento: new Date(2026, 5, 10),
        modalidade: 'SEM_JUSTA_CAUSA',
        tipoAvisoPrevio: 'INDENIZADO', // projeta -> 7 avos
      });

      const d = detalheDe(resultado, 'FERIAS_PROPORCIONAIS');
      expect(d?.base).toBe(1750); // 3000/12*7
      expect(d?.terco).toBe(583.33);
      expect((d?.base ?? 0) + (d?.terco ?? 0)).toBe(
        valorDe(resultado, 'FERIAS_PROPORCIONAIS'),
      );
    });

    it('férias vencidas separam base e 1/3 constitucional', () => {
      const resultado = calcular({
        salarioMensal: 3000,
        dataAdmissao: new Date(2020, 0, 1),
        dataDesligamento: new Date(2026, 5, 10),
        modalidade: 'PEDIDO_DEMISSAO',
        diasFeriasVencidas: 10,
      });

      const d = detalheDe(resultado, 'FERIAS_VENCIDAS');
      expect(d?.base).toBe(1000); // 3000/30*10
      expect(d?.terco).toBe(333.33);
    });

    it('aviso prévio indenizado decompõe base (30) + proporcional (3/ano)', () => {
      // Dados do TRCT real, porém como demissão sem justa causa (para haver aviso).
      const resultado = calcular({
        salarioMensal: 15246.19,
        dataAdmissao: new Date(2021, 6, 13), // 13/07/2021 -> 4 anos completos
        dataDesligamento: new Date(2026, 1, 19), // 19/02/2026
        modalidade: 'SEM_JUSTA_CAUSA',
        tipoAvisoPrevio: 'INDENIZADO',
      });

      const d = detalheDe(resultado, 'AVISO_PREVIO_INDENIZADO');
      expect(d?.dias).toBe(42); // 30 + 3*4
      expect(d?.avisoBase).toBe(30);
      expect(d?.avisoProporcional).toBe(12);
      expect(d?.avisoAnos).toBe(4);
    });

    it('aviso prévio indenizado expõe os dias (metade no acordo mútuo)', () => {
      const indenizado = calcular({
        salarioMensal: 3000,
        dataAdmissao: new Date(2020, 0, 1), // 6 anos -> 48 dias
        dataDesligamento: new Date(2026, 5, 10),
        modalidade: 'SEM_JUSTA_CAUSA',
        tipoAvisoPrevio: 'INDENIZADO',
      });
      expect(detalheDe(indenizado, 'AVISO_PREVIO_INDENIZADO')?.dias).toBe(48);

      const acordo = calcular({
        salarioMensal: 3000,
        dataAdmissao: new Date(2020, 0, 1),
        dataDesligamento: new Date(2026, 5, 10),
        modalidade: 'ACORDO_MUTUO',
        tipoAvisoPrevio: 'INDENIZADO',
      });
      expect(detalheDe(acordo, 'AVISO_PREVIO_INDENIZADO')?.dias).toBe(24);
    });

    it('multa FGTS expõe percentual, base e se o saldo foi estimado', () => {
      const informado = calcular({
        salarioMensal: 3000,
        dataAdmissao: new Date(2020, 0, 1),
        dataDesligamento: new Date(2026, 5, 10),
        modalidade: 'SEM_JUSTA_CAUSA',
        saldoFgts: 10000,
      });
      const detInformado = detalheDe(informado, 'MULTA_FGTS');
      expect(detInformado?.percentual).toBe(0.4);
      expect(detInformado?.baseFgts).toBe(10000);
      expect(detInformado?.fgtsEstimado).toBe(false);

      const estimado = calcular({
        salarioMensal: 3000,
        dataAdmissao: new Date(2026, 0, 1),
        dataDesligamento: new Date(2026, 3, 10), // 3 meses -> saldo estimado 720
        modalidade: 'ACORDO_MUTUO',
      });
      const detEstimado = detalheDe(estimado, 'MULTA_FGTS');
      expect(detEstimado?.percentual).toBe(0.2);
      expect(detEstimado?.baseFgts).toBe(720);
      expect(detEstimado?.fgtsEstimado).toBe(true);
    });
  });
});
