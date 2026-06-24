import { useMemo } from 'react';
import { calcular } from '../dominio/calculadora';
import {
  descricaoDesconto,
  descricaoVerba,
  totais,
  type Rescisao,
  type Verba,
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

/** Sub-legenda dinâmica de cada verba a partir da memória de cálculo (detalhe). */
function subVerba(v: Verba): string {
  const d = v.detalhe;
  switch (v.tipo) {
    case 'SALDO_SALARIO':
      return d?.dias !== undefined
        ? `${d.dias} de 30 dias trabalhados`
        : 'proporcional aos dias trabalhados';
    case 'DECIMO_TERCEIRO_PROPORCIONAL':
      return d?.avos !== undefined ? `${d.avos}/12 avos` : 'avos do ano';
    case 'FERIAS_PROPORCIONAIS':
      return d?.avos !== undefined ? `${d.avos}/12 avos` : 'período aquisitivo';
    case 'FERIAS_VENCIDAS':
      return d?.dias !== undefined
        ? `${d.dias} dias não usufruídos`
        : 'período não usufruído';
    case 'AVISO_PREVIO_INDENIZADO': {
      if (d?.dias === undefined) return 'projeta a data de saída';
      const dias = Math.round(d.dias);
      if (!d.avisoProporcional || d.avisoBase === undefined) return `${dias} dias`;
      const cheio = d.avisoBase + d.avisoProporcional;
      // Explica o proporcional (3 dias/ano) quando os anos batem com o teto.
      const anos = d.avisoAnos;
      const proporcional =
        anos !== undefined && d.avisoProporcional === 3 * anos
          ? `3 dias/ano × ${anos} ${anos === 1 ? 'ano' : 'anos'}`
          : `${d.avisoProporcional} dias`;
      const composicao = `${d.avisoBase} + ${proporcional}`;
      // No acordo (484-A) os dias pagos são metade da composição legal.
      return d.dias < cheio
        ? `${dias} dias (metade de ${composicao})`
        : `${dias} dias (${composicao})`;
    }
    case 'MULTA_FGTS':
      if (d?.percentual !== undefined && d.baseFgts !== undefined) {
        const pct = Math.round(d.percentual * 100);
        const estimado = d.fgtsEstimado ? ' (estimado)' : '';
        return `${pct}% sobre ${fmt(d.baseFgts)}${estimado}`;
      }
      return 'sobre o saldo do FGTS';
  }
}

/**
 * Itens de exibição de uma verba. Férias geram duas linhas: a base e o 1/3
 * constitucional em linha própria (base + 1/3 = valor da verba).
 */
function itensDaVerba(v: Verba): ItemResultado[] {
  const ehFerias =
    v.tipo === 'FERIAS_PROPORCIONAIS' || v.tipo === 'FERIAS_VENCIDAS';
  const principal: ItemResultado = {
    label: descricaoVerba[v.tipo],
    sub: subVerba(v),
    valorFmt: fmt(ehFerias && v.detalhe?.base !== undefined ? v.detalhe.base : v.valor),
  };
  if (ehFerias) {
    const ref =
      v.tipo === 'FERIAS_PROPORCIONAIS' ? 'férias proporcionais' : 'férias vencidas';
    return [
      principal,
      {
        label: '1/3 constitucional',
        sub: `sobre as ${ref}`,
        valorFmt: fmt(v.detalhe?.terco ?? 0),
      },
    ];
  }
  return [principal];
}

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

export interface ItemDesconto {
  label: string;
  valorFmt: string;
}

export interface ResultadoView {
  valid: boolean;
  tipoLabel: string;
  tipoDesc: string;
  nota: string;
  items: ItemResultado[];
  totalBrutoFmt: string;
  descontos: ItemDesconto[];
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
      descontos: [],
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
      .flatMap(itensDaVerba);

    const descontos = resultado.descontos
      .filter((d) => d.valor > 0)
      .map((d) => ({ label: descricaoDesconto[d.tipo], valorFmt: fmt(d.valor) }));

    return {
      valid: true,
      tipoLabel: opcao.label,
      tipoDesc: opcao.desc,
      nota: opcao.nota,
      items,
      totalBrutoFmt: fmt(t.bruto),
      descontos,
      descontosFmt: fmt(t.descontos),
      liquidoFmt: fmt(t.liquido),
      temDescontos: t.descontos > 0,
      temSaque: resultado.fgtsSaque > 0,
      saqueFmt: fmt(resultado.fgtsSaque),
    };
  }, [form]);
}
