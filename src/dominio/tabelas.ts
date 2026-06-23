// Parâmetros legais versionados por vigência (ADR 0002). O cálculo resolve a
// tabela vigente na data de desligamento.

import { arredondar } from './dinheiro';

export interface FaixaInss {
  ate: number;
  aliquota: number;
}

export interface TabelaInss {
  vigenciaInicio: Date;
  teto: number;
  faixas: FaixaInss[];
}

const TABELAS_INSS: TabelaInss[] = [
  {
    vigenciaInicio: new Date(2026, 0, 1),
    teto: 8475.55,
    faixas: [
      { ate: 1621.0, aliquota: 0.075 },
      { ate: 2902.84, aliquota: 0.09 },
      { ate: 4354.27, aliquota: 0.12 },
      { ate: 8475.55, aliquota: 0.14 },
    ],
  },
];

/** Tabela INSS vigente na data: a de maior vigenciaInicio <= data. */
export function tabelaInssVigente(data: Date): TabelaInss {
  const vigentes = TABELAS_INSS.filter((t) => t.vigenciaInicio <= data).sort(
    (a, b) => b.vigenciaInicio.getTime() - a.vigenciaInicio.getTime(),
  );
  if (vigentes.length === 0) {
    throw new Error(`Sem tabela INSS vigente para ${data.toISOString()}`);
  }
  return vigentes[0];
}

/** INSS progressivo: cada alíquota incide só sobre a parcela da sua faixa. */
export function calcularInss(base: number, data: Date): number {
  const tabela = tabelaInssVigente(data);
  const baseLimitada = Math.min(base, tabela.teto);
  let inss = 0;
  let pisoFaixa = 0;
  for (const faixa of tabela.faixas) {
    if (baseLimitada <= pisoFaixa) {
      break;
    }
    const topo = Math.min(baseLimitada, faixa.ate);
    inss += (topo - pisoFaixa) * faixa.aliquota;
    pisoFaixa = faixa.ate;
  }
  return arredondar(inss);
}

export interface FaixaIrrf {
  ate: number;
  aliquota: number;
  deduzir: number;
}

/** Redutor da Lei 15.270/2025, aplicado sobre o imposto da tabela. */
export interface Redutor {
  isencaoAte: number;
  valorIsencao: number;
  limiteSuperior: number;
  coefA: number;
  coefB: number;
}

export interface TabelaIrrf {
  vigenciaInicio: Date;
  dependente: number;
  descontoSimplificado: number;
  faixas: FaixaIrrf[];
  redutor: Redutor;
}

const TABELAS_IRRF: TabelaIrrf[] = [
  {
    vigenciaInicio: new Date(2026, 0, 1),
    dependente: 189.59,
    descontoSimplificado: 607.2,
    faixas: [
      { ate: 2428.8, aliquota: 0, deduzir: 0 },
      { ate: 2826.65, aliquota: 0.075, deduzir: 182.16 },
      { ate: 3751.05, aliquota: 0.15, deduzir: 394.16 },
      { ate: 4664.68, aliquota: 0.225, deduzir: 675.49 },
      { ate: Infinity, aliquota: 0.275, deduzir: 908.73 },
    ],
    redutor: {
      isencaoAte: 5000,
      valorIsencao: 312.89,
      limiteSuperior: 7350,
      coefA: 978.62,
      coefB: 0.133145,
    },
  },
];

function tabelaIrrfVigente(data: Date): TabelaIrrf {
  const vigentes = TABELAS_IRRF.filter((t) => t.vigenciaInicio <= data).sort(
    (a, b) => b.vigenciaInicio.getTime() - a.vigenciaInicio.getTime(),
  );
  if (vigentes.length === 0) {
    throw new Error(`Sem tabela IRRF vigente para ${data.toISOString()}`);
  }
  return vigentes[0];
}

function valorRedutor(rendimentoBruto: number, r: Redutor): number {
  if (rendimentoBruto <= r.isencaoAte) {
    return r.valorIsencao;
  }
  if (rendimentoBruto <= r.limiteSuperior) {
    return r.coefA - r.coefB * rendimentoBruto;
  }
  return 0;
}

/**
 * IRRF sobre uma verba tributável. A base usa a maior dedução (legal ou
 * simplificada); o redutor (Lei 15.270) incide sobre o rendimento bruto.
 */
export function calcularIrrf(
  rendimentoBruto: number,
  inss: number,
  dependentes: number,
  data: Date,
): number {
  const tabela = tabelaIrrfVigente(data);
  const deducaoLegal = inss + dependentes * tabela.dependente;
  const deducao = Math.max(deducaoLegal, tabela.descontoSimplificado);
  const base = rendimentoBruto - deducao;
  const faixa = tabela.faixas.find((f) => base <= f.ate)!;
  const impostoTabela = Math.max(0, base * faixa.aliquota - faixa.deduzir);
  const redutor = Math.min(valorRedutor(rendimentoBruto, tabela.redutor), impostoTabela);
  return arredondar(impostoTabela - redutor);
}
