import { describe, it, expect } from 'vitest';
import { calcular } from './calculadora';
import { valorDe, valorDesconto, totais, type Rescisao } from './tipos';

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
});
