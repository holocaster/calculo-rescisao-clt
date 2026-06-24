// Tipos do domínio de rescisão trabalhista. Sem dependência de React.

export type Modalidade =
  | 'SEM_JUSTA_CAUSA'
  | 'PEDIDO_DEMISSAO'
  | 'JUSTA_CAUSA'
  | 'ACORDO_MUTUO'
  | 'EXPERIENCIA';

export type TipoVerba =
  | 'SALDO_SALARIO'
  | 'DECIMO_TERCEIRO_PROPORCIONAL'
  | 'FERIAS_PROPORCIONAIS'
  | 'FERIAS_VENCIDAS'
  | 'AVISO_PREVIO_INDENIZADO'
  | 'MULTA_FGTS';

export const descricaoVerba: Record<TipoVerba, string> = {
  SALDO_SALARIO: 'Saldo de salário',
  DECIMO_TERCEIRO_PROPORCIONAL: '13º proporcional',
  FERIAS_PROPORCIONAIS: 'Férias proporcionais',
  FERIAS_VENCIDAS: 'Férias vencidas',
  AVISO_PREVIO_INDENIZADO: 'Aviso prévio indenizado',
  MULTA_FGTS: 'Multa do FGTS',
};

/** Forma de cumprimento do aviso prévio. Só INDENIZADO projeta a data de saída. */
export type TipoAvisoPrevio = 'INDENIZADO' | 'TRABALHADO' | 'DISPENSADO';

/** Dados de entrada de uma rescisão. */
export interface Rescisao {
  salarioMensal: number;
  dataAdmissao: Date;
  dataDesligamento: Date;
  modalidade: Modalidade;
  /** Saldo de dias de férias vencidas ainda a receber (período de 30 dias). Default 0. */
  diasFeriasVencidas?: number;
  /** Default: sem aviso indenizado (não projeta). */
  tipoAvisoPrevio?: TipoAvisoPrevio;
  /**
   * Dias de aviso prévio efetivamente trabalhados no pedido de demissão (0..30).
   * Os dias não trabalhados são descontados. Default 30 (cumpriu integralmente).
   */
  diasAvisoTrabalhados?: number;
  /** Pedido de demissão: empregador dispensou o aviso, sem desconto. Default false. */
  empregadorDispensouAviso?: boolean;
  /** Saldo do FGTS informado pelo usuário. Se ausente, é estimado. */
  saldoFgts?: number;
  /** Nº de dependentes para dedução de IRRF. Default 0. */
  dependentes?: number;
}

/** Memória de cálculo: componentes numéricos que originaram o valor da verba. */
export interface DetalheVerba {
  /** Dias considerados (saldo de salário, férias vencidas, aviso indenizado). */
  dias?: number;
  /** Avos/meses considerados (13º, férias proporcionais). */
  avos?: number;
  /** Valor das férias sem o 1/3 constitucional. */
  base?: number;
  /** Valor do 1/3 constitucional sobre as férias. */
  terco?: number;
  /** Aviso prévio: dias fixos da base legal (30). */
  avisoBase?: number;
  /** Aviso prévio: dias proporcionais (3 por ano completo, teto 90 no total). */
  avisoProporcional?: number;
  /** Aviso prévio: anos completos de contrato que geraram o proporcional. */
  avisoAnos?: number;
  /** Percentual da multa do FGTS (0.4 = 40%). */
  percentual?: number;
  /** Saldo do FGTS usado como base da multa. */
  baseFgts?: number;
  /** True quando o saldo do FGTS foi estimado (usuário não informou). */
  fgtsEstimado?: boolean;
}

/** Uma verba apurada, com seu valor bruto e a memória de cálculo. */
export interface Verba {
  tipo: TipoVerba;
  valor: number;
  detalhe?: DetalheVerba;
}

export type TipoDesconto =
  | 'INSS_SALARIO'
  | 'INSS_DECIMO_TERCEIRO'
  | 'IRRF_SALARIO'
  | 'IRRF_DECIMO_TERCEIRO'
  | 'AVISO_PREVIO_NAO_CUMPRIDO';

export const descricaoDesconto: Record<TipoDesconto, string> = {
  INSS_SALARIO: 'INSS',
  INSS_DECIMO_TERCEIRO: 'INSS sobre 13º',
  IRRF_SALARIO: 'IRRF',
  IRRF_DECIMO_TERCEIRO: 'IRRF sobre 13º',
  AVISO_PREVIO_NAO_CUMPRIDO: 'Aviso prévio não cumprido',
};

/** Um desconto aplicado sobre as verbas tributáveis. */
export interface Desconto {
  tipo: TipoDesconto;
  valor: number;
}

/** Resultado da apuração: verbas brutas e descontos. */
export interface ResultadoRescisao {
  verbas: Verba[];
  descontos: Desconto[];
  /** Saldo do FGTS liberado para saque. Exibido à parte, não entra no total. */
  fgtsSaque: number;
}

/** Valor bruto da verba do tipo informado, ou 0 se não devida. */
export function valorDe(resultado: ResultadoRescisao, tipo: TipoVerba): number {
  return resultado.verbas.find((v) => v.tipo === tipo)?.valor ?? 0;
}

/** Valor do desconto do tipo informado, ou 0. */
export function valorDesconto(
  resultado: ResultadoRescisao,
  tipo: TipoDesconto,
): number {
  return resultado.descontos.find((d) => d.tipo === tipo)?.valor ?? 0;
}

export interface Totais {
  bruto: number;
  descontos: number;
  liquido: number;
}

/** Soma das verbas, dos descontos e o líquido (bruto - descontos). */
export function totais(resultado: ResultadoRescisao): Totais {
  const bruto = resultado.verbas.reduce((s, v) => s + v.valor, 0);
  const descontos = resultado.descontos.reduce((s, d) => s + d.valor, 0);
  return { bruto, descontos, liquido: bruto - descontos };
}
