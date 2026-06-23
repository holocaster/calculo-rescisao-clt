import { useMemo } from 'react';
import { calcular } from '../dominio/calculadora';
import {
  descricaoVerba,
  totais,
  valorDesconto,
  type Rescisao,
  type TipoVerba,
} from '../dominio/tipos';
import { mapaModalidade, tipoOptions, type TipoForm } from './labels';
import { parseMoeda } from './mascaras';

export interface FormState {
  tipo: TipoForm;
  salario: string;
  admissao: string;
  saida: string;
  fgts: string;
  dependentes: string;
  diasFeriasVencidas: string;
  diasAvisoTrabalhados: string;
  empregadorDispensouAviso: boolean;
}

export const estadoInicial: FormState = {
  tipo: 'sem_justa_causa',
  salario: '',
  admissao: '',
  saida: '',
  fgts: '',
  dependentes: '',
  diasFeriasVencidas: '',
  diasAvisoTrabalhados: '',
  empregadorDispensouAviso: false,
};

const fmt = (v: number): string =>
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const subVerba: Record<TipoVerba, string> = {
  SALDO_SALARIO: 'proporcional aos dias trabalhados',
  DECIMO_TERCEIRO_PROPORCIONAL: 'avos do ano',
  FERIAS_PROPORCIONAIS: 'período aquisitivo + 1/3',
  FERIAS_VENCIDAS: 'período não usufruído + 1/3',
  AVISO_PREVIO_INDENIZADO: 'projeta a data de saída',
  MULTA_FGTS: 'sobre o saldo do FGTS',
};

/** Aplica máscara dd/mm/aaaa enquanto o usuário digita. */
export function maskData(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length >= 3) out += '/' + d.slice(2, 4);
  if (d.length >= 5) out += '/' + d.slice(4, 8);
  return out;
}

/** Converte dd/mm/aaaa em Date, rejeitando datas inválidas. */
function parseDate(str: string): Date | null {
  const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const dia = +m[1];
  const mes = +m[2];
  const ano = +m[3];
  const d = new Date(ano, mes - 1, dia);
  const valido =
    d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
  return valido ? d : null;
}

export interface ErrosFormulario {
  admissao?: string;
  saida?: string;
}

/** Erros de preenchimento das datas (só após digitação completa: 10 chars). */
export function validarFormulario(form: FormState): ErrosFormulario {
  const erros: ErrosFormulario = {};
  if (form.admissao.length === 10 && !parseDate(form.admissao)) {
    erros.admissao = 'Data inválida.';
  }
  if (form.saida.length === 10 && !parseDate(form.saida)) {
    erros.saida = 'Data inválida.';
  }
  const adm = parseDate(form.admissao);
  const sai = parseDate(form.saida);
  if (!erros.saida && adm && sai && sai <= adm) {
    erros.saida = 'O último dia deve ser posterior à admissão.';
  }
  return erros;
}

export interface ItemResultado {
  label: string;
  sub: string;
  valorFmt: string;
}

export interface ResultadoView {
  valid: boolean;
  tipoLabel: string;
  tipoDesc: string;
  nota: string;
  items: ItemResultado[];
  totalBrutoFmt: string;
  inssFmt: string;
  irrfFmt: string;
  avisoNaoCumpridoFmt: string;
  temAvisoNaoCumprido: boolean;
  descontosFmt: string;
  liquidoFmt: string;
  temDescontos: boolean;
  temSaque: boolean;
  saqueFmt: string;
}

export function useCalculoRescisao(form: FormState): ResultadoView {
  return useMemo(() => {
    const opcao = tipoOptions.find((o) => o.value === form.tipo)!;
    const salario = parseMoeda(form.salario) || 0;
    const admissao = parseDate(form.admissao);
    const desligamento = parseDate(form.saida);
    const valid = salario > 0 && !!admissao && !!desligamento && desligamento > admissao;

    const vazio: ResultadoView = {
      valid: false,
      tipoLabel: opcao.label,
      tipoDesc: opcao.desc,
      nota: opcao.nota,
      items: [],
      totalBrutoFmt: fmt(0),
      inssFmt: fmt(0),
      irrfFmt: fmt(0),
      avisoNaoCumpridoFmt: fmt(0),
      temAvisoNaoCumprido: false,
      descontosFmt: fmt(0),
      liquidoFmt: fmt(0),
      temDescontos: false,
      temSaque: false,
      saqueFmt: fmt(0),
    };
    if (!valid) return vazio;

    const fgts = parseMoeda(form.fgts);
    const rescisao: Rescisao = {
      salarioMensal: salario,
      dataAdmissao: admissao,
      dataDesligamento: desligamento,
      dependentes: parseInt(form.dependentes, 10) || 0,
      diasFeriasVencidas: parseInt(form.diasFeriasVencidas, 10) || 0,
      saldoFgts: form.fgts !== '' && fgts >= 0 ? fgts : undefined,
      diasAvisoTrabalhados:
        form.diasAvisoTrabalhados !== ''
          ? parseInt(form.diasAvisoTrabalhados, 10)
          : undefined,
      empregadorDispensouAviso: form.empregadorDispensouAviso,
      ...mapaModalidade[form.tipo],
    };

    const resultado = calcular(rescisao);
    const t = totais(resultado);

    const items = resultado.verbas
      .filter((v) => v.valor > 0)
      .map((v) => ({
        label: descricaoVerba[v.tipo],
        sub: subVerba[v.tipo],
        valorFmt: fmt(v.valor),
      }));

    const inss =
      valorDesconto(resultado, 'INSS_SALARIO') +
      valorDesconto(resultado, 'INSS_DECIMO_TERCEIRO');
    const irrf =
      valorDesconto(resultado, 'IRRF_SALARIO') +
      valorDesconto(resultado, 'IRRF_DECIMO_TERCEIRO');
    const avisoNaoCumprido = valorDesconto(resultado, 'AVISO_PREVIO_NAO_CUMPRIDO');

    return {
      valid: true,
      tipoLabel: opcao.label,
      tipoDesc: opcao.desc,
      nota: opcao.nota,
      items,
      totalBrutoFmt: fmt(t.bruto),
      inssFmt: fmt(inss),
      irrfFmt: fmt(irrf),
      avisoNaoCumpridoFmt: fmt(avisoNaoCumprido),
      temAvisoNaoCumprido: avisoNaoCumprido > 0,
      descontosFmt: fmt(t.descontos),
      liquidoFmt: fmt(t.liquido),
      temDescontos: t.descontos > 0,
      temSaque: resultado.fgtsSaque > 0,
      saqueFmt: fmt(resultado.fgtsSaque),
    };
  }, [form]);
}
