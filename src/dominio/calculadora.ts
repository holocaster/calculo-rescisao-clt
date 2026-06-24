import type { DetalheVerba, Rescisao, ResultadoRescisao, Verba } from './tipos';
import { arredondar } from './dinheiro';
import { calcularInss, calcularIrrf } from './tabelas';

const DIAS_MES = 30;
const MESES_ANO = 12;
/** Fator que adiciona o 1/3 constitucional sobre as férias. */
const COM_TERCO_CONSTITUCIONAL = 4 / 3;

/** Verba com sua memória de cálculo (componentes que originaram o valor). */
type VerbaApurada = { valor: number; detalhe: DetalheVerba };

function saldoDeSalario(r: Rescisao): VerbaApurada {
  const dias = r.dataDesligamento.getDate();
  return {
    valor: arredondar((r.salarioMensal / DIAS_MES) * dias),
    detalhe: { dias },
  };
}

function addDias(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Anos completos de contrato até o desligamento. */
function anosCompletos(admissao: Date, desligamento: Date): number {
  let anos = desligamento.getFullYear() - admissao.getFullYear();
  const aniversario = new Date(
    desligamento.getFullYear(), admissao.getMonth(), admissao.getDate());
  if (aniversario > desligamento) {
    anos -= 1;
  }
  return anos;
}

/** Dias de aviso prévio: 30 + 3 por ano completo, teto 90 (Lei 12.506/2011). */
function diasAvisoPrevio(r: Rescisao): number {
  return Math.min(30 + 3 * anosCompletos(r.dataAdmissao, r.dataDesligamento), 90);
}

/** Acordo mútuo (484-A) paga e projeta metade do aviso indenizado. */
function fatorAviso(modalidade: Rescisao['modalidade']): number {
  return modalidade === 'ACORDO_MUTUO' ? 0.5 : 1;
}

/** Dias de aviso indenizado efetivos (cheios ou pela metade no acordo). */
function diasAvisoIndenizado(r: Rescisao): number {
  return diasAvisoPrevio(r) * fatorAviso(r.modalidade);
}

/**
 * Data de saída para efeito de avos. Aviso indenizado projeta a data
 * (art. 487 §1º CLT); demais casos usam a data de desligamento informada.
 */
function dataFimEfetiva(r: Rescisao): Date {
  if (r.tipoAvisoPrevio === 'INDENIZADO') {
    return addDias(r.dataDesligamento, diasAvisoIndenizado(r));
  }
  return r.dataDesligamento;
}

function avisoPrevioIndenizado(r: Rescisao): VerbaApurada {
  if (r.tipoAvisoPrevio !== 'INDENIZADO') {
    return { valor: 0, detalhe: { dias: 0 } };
  }
  const dias = diasAvisoIndenizado(r);
  // Composição legal (antes do fator do acordo): 30 fixos + proporcional (com teto 90).
  const avisoBase = DIAS_MES;
  const avisoProporcional = diasAvisoPrevio(r) - avisoBase;
  const avisoAnos = anosCompletos(r.dataAdmissao, r.dataDesligamento);
  return {
    valor: arredondar((r.salarioMensal / DIAS_MES) * dias),
    detalhe: { dias, avisoBase, avisoProporcional, avisoAnos },
  };
}

/** Dias de aviso que o empregado deve no pedido de demissão (sempre 30, ADR 0004). */
const DIAS_AVISO_DEVIDOS = 30;

/**
 * Desconto pelo aviso prévio não cumprido. Só no pedido de demissão: os dias
 * devidos (30) não trabalhados são descontados, salvo se o empregador dispensou.
 */
function avisoNaoCumprido(r: Rescisao): number {
  if (r.modalidade !== 'PEDIDO_DEMISSAO' || r.empregadorDispensouAviso) {
    return 0;
  }
  const trabalhados = Math.min(Math.max(r.diasAvisoTrabalhados ?? DIAS_AVISO_DEVIDOS, 0), DIAS_AVISO_DEVIDOS);
  const faltantes = DIAS_AVISO_DEVIDOS - trabalhados;
  return arredondar((r.salarioMensal / DIAS_MES) * faltantes);
}

/**
 * Avos de 13º: meses civis do ano do desligamento com >= 15 dias trabalhados,
 * a partir do mês de admissão (mesmo ano) ou de janeiro (admitido antes).
 */
function avosDecimoTerceiro(admissao: Date, fim: Date): number {
  const ano = fim.getFullYear();
  const mesmoAno = admissao.getFullYear() === ano;
  const mesInicial = mesmoAno ? admissao.getMonth() : 0;
  let avos = 0;
  for (let mes = mesInicial; mes <= fim.getMonth(); mes++) {
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    const primeiro = mesmoAno && mes === admissao.getMonth() ? admissao.getDate() : 1;
    const ultimo = mes === fim.getMonth() ? fim.getDate() : ultimoDiaMes;
    if (ultimo - primeiro + 1 >= 15) avos += 1;
  }
  return avos;
}

function decimoTerceiroProporcional(r: Rescisao): VerbaApurada {
  if (r.modalidade === 'JUSTA_CAUSA') {
    return { valor: 0, detalhe: { avos: 0 } }; // justa causa perde o 13º proporcional
  }
  const avos = avosDecimoTerceiro(r.dataAdmissao, dataFimEfetiva(r));
  return {
    valor: arredondar((r.salarioMensal / MESES_ANO) * avos),
    detalhe: { avos },
  };
}

/** Início do período aquisitivo atual: último aniversário de admissão <= fim. */
function inicioPeriodoAquisitivo(admissao: Date, fim: Date): Date {
  const cand = new Date(fim.getFullYear(), admissao.getMonth(), admissao.getDate());
  if (cand > fim) {
    return new Date(fim.getFullYear() - 1, admissao.getMonth(), admissao.getDate());
  }
  return cand;
}

/** Meses entre duas datas: meses cheios + fração final >= 15 dias. Sem teto. */
function contarMesesComFracao(inicio: Date, fim: Date): number {
  let meses = 0;
  const cursor = new Date(inicio);
  while (true) {
    const prox = new Date(cursor);
    prox.setMonth(prox.getMonth() + 1);
    if (prox <= fim) {
      meses += 1;
      cursor.setTime(prox.getTime());
    } else {
      break;
    }
  }
  const diasRestantes = Math.round((fim.getTime() - cursor.getTime()) / 86_400_000);
  if (diasRestantes >= 15) {
    meses += 1;
  }
  return meses;
}

/** Avos de um período aquisitivo (teto de 12). */
function avosPeriodoAquisitivo(inicio: Date, fim: Date): number {
  return Math.min(contarMesesComFracao(inicio, fim), 12);
}

function feriasProporcionais(r: Rescisao): VerbaApurada {
  if (r.modalidade === 'JUSTA_CAUSA') {
    return { valor: 0, detalhe: { avos: 0 } }; // justa causa perde as férias proporcionais
  }
  const fim = dataFimEfetiva(r);
  const inicio = inicioPeriodoAquisitivo(r.dataAdmissao, fim);
  const avos = avosPeriodoAquisitivo(inicio, fim);
  const base = (r.salarioMensal / MESES_ANO) * avos;
  return comTerco(arredondar(base * COM_TERCO_CONSTITUCIONAL), arredondar(base), { avos });
}

function feriasVencidas(r: Rescisao): VerbaApurada {
  const dias = r.diasFeriasVencidas ?? 0;
  const base = (r.salarioMensal / DIAS_MES) * dias;
  return comTerco(arredondar(base * COM_TERCO_CONSTITUCIONAL), arredondar(base), { dias });
}

/** Monta uma verba de férias com base e 1/3 separados (base + terço = valor). */
function comTerco(valor: number, base: number, extra: DetalheVerba): VerbaApurada {
  return { valor, detalhe: { ...extra, base, terco: arredondar(valor - base) } };
}

/** Percentual da multa do FGTS por modalidade. */
function percentualMultaFgts(modalidade: Rescisao['modalidade']): number {
  switch (modalidade) {
    case 'SEM_JUSTA_CAUSA':
      return 0.4;
    case 'ACORDO_MUTUO':
      return 0.2;
    default:
      return 0;
  }
}

/** Percentual do FGTS liberado para saque por modalidade. */
function percentualSaqueFgts(modalidade: Rescisao['modalidade']): number {
  switch (modalidade) {
    case 'SEM_JUSTA_CAUSA':
    case 'EXPERIENCIA':
      return 1;
    case 'ACORDO_MUTUO':
      return 0.8;
    default:
      return 0;
  }
}

/** Saldo do FGTS: informado, ou estimado em 8% x salário x meses de contrato. */
function saldoFgtsBase(r: Rescisao): number {
  if (r.saldoFgts !== undefined) {
    return r.saldoFgts;
  }
  const meses = contarMesesComFracao(r.dataAdmissao, r.dataDesligamento);
  return 0.08 * r.salarioMensal * meses;
}

function multaFgts(r: Rescisao): VerbaApurada {
  const percentual = percentualMultaFgts(r.modalidade);
  const baseFgts = arredondar(saldoFgtsBase(r));
  const fgtsEstimado = r.saldoFgts === undefined;
  if (percentual === 0) {
    return { valor: 0, detalhe: { percentual, baseFgts, fgtsEstimado } };
  }
  return {
    valor: arredondar(saldoFgtsBase(r) * percentual),
    detalhe: { percentual, baseFgts, fgtsEstimado },
  };
}

/** Motor de cálculo das verbas rescisórias. */
export function calcular(rescisao: Rescisao): ResultadoRescisao {
  const saldo = saldoDeSalario(rescisao);
  const decimoTerceiro = decimoTerceiroProporcional(rescisao);
  const data = rescisao.dataDesligamento;
  const dependentes = rescisao.dependentes ?? 0;

  const inssSaldo = calcularInss(saldo.valor, data);
  const inssDecimoTerceiro = calcularInss(decimoTerceiro.valor, data);

  const verba = (tipo: Verba['tipo'], apurada: VerbaApurada): Verba => ({
    tipo,
    valor: apurada.valor,
    detalhe: apurada.detalhe,
  });

  return {
    verbas: [
      verba('SALDO_SALARIO', saldo),
      verba('DECIMO_TERCEIRO_PROPORCIONAL', decimoTerceiro),
      verba('FERIAS_PROPORCIONAIS', feriasProporcionais(rescisao)),
      verba('FERIAS_VENCIDAS', feriasVencidas(rescisao)),
      verba('AVISO_PREVIO_INDENIZADO', avisoPrevioIndenizado(rescisao)),
      verba('MULTA_FGTS', multaFgts(rescisao)),
    ],
    descontos: [
      // INSS e IRRF incidem só sobre saldo de salário e 13º, com bases separadas.
      { tipo: 'INSS_SALARIO', valor: inssSaldo },
      { tipo: 'INSS_DECIMO_TERCEIRO', valor: inssDecimoTerceiro },
      {
        tipo: 'IRRF_SALARIO',
        valor: calcularIrrf(saldo.valor, inssSaldo, dependentes, data),
      },
      {
        // Suposição a confirmar: o redutor da Lei 15.270 é aplicado também ao
        // 13º (tributação exclusiva), usando o 13º como rendimento bruto.
        tipo: 'IRRF_DECIMO_TERCEIRO',
        valor: calcularIrrf(decimoTerceiro.valor, inssDecimoTerceiro, dependentes, data),
      },
      { tipo: 'AVISO_PREVIO_NAO_CUMPRIDO', valor: avisoNaoCumprido(rescisao) },
    ],
    fgtsSaque: arredondar(
      saldoFgtsBase(rescisao) * percentualSaqueFgts(rescisao.modalidade),
    ),
  };
}
