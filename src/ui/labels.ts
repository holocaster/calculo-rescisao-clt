import type { Modalidade, TipoAvisoPrevio } from '../dominio/tipos';

// Valores do select (verbatim do handoff de design) e mapeamento para o domínio.
export type TipoForm =
  | 'sem_justa_causa'
  | 'acordo'
  | 'pedido_demissao'
  | 'justa_causa'
  | 'experiencia';

export interface OpcaoTipo {
  value: TipoForm;
  label: string;
  desc: string;
  nota: string;
}

export const tipoOptions: OpcaoTipo[] = [
  {
    value: 'sem_justa_causa',
    label: 'Demissão sem justa causa',
    desc: 'A empresa te dispensou sem motivo grave. É o cenário com mais direitos.',
    nota: 'Cenário com todos os direitos: aviso prévio, multa de 40% e saque integral do FGTS.',
  },
  {
    value: 'acordo',
    label: 'Rescisão por acordo (comum acordo)',
    desc: 'Acordo entre as duas partes para encerrar o contrato.',
    nota: 'No acordo, o aviso indenizado e a multa do FGTS saem pela metade (20%), e o saque é limitado a 80%.',
  },
  {
    value: 'pedido_demissao',
    label: 'Pedido de demissão',
    desc: 'Você pediu para sair da empresa.',
    nota: 'Você não tem direito à multa de 40% nem ao saque do FGTS, e deve cumprir (ou ter descontado) o aviso prévio.',
  },
  {
    value: 'justa_causa',
    label: 'Demissão por justa causa',
    desc: 'Desligamento por falta grave do empregado.',
    nota: 'Na justa causa você recebe apenas o saldo de salário e as férias vencidas, se houver.',
  },
  {
    value: 'experiencia',
    label: 'Fim do contrato de experiência',
    desc: 'Contrato de experiência encerrado no prazo combinado.',
    nota: 'Encerrado no prazo: não há aviso prévio nem multa, mas o FGTS pode ser sacado.',
  },
];

interface MapaModalidade {
  modalidade: Modalidade;
  tipoAvisoPrevio?: TipoAvisoPrevio;
}

export const mapaModalidade: Record<TipoForm, MapaModalidade> = {
  sem_justa_causa: { modalidade: 'SEM_JUSTA_CAUSA', tipoAvisoPrevio: 'INDENIZADO' },
  acordo: { modalidade: 'ACORDO_MUTUO', tipoAvisoPrevio: 'INDENIZADO' },
  pedido_demissao: { modalidade: 'PEDIDO_DEMISSAO' },
  justa_causa: { modalidade: 'JUSTA_CAUSA' },
  experiencia: { modalidade: 'EXPERIENCIA' },
};
