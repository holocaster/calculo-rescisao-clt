import { createPortal } from 'react-dom';
import type { FormState } from './useCalculoRescisao';
import type { ResultadoView } from './useCalculoRescisao';

interface Props {
  form: FormState;
  view: ResultadoView;
}

interface DadoInformado {
  label: string;
  valor: string;
}

/** Linhas de "Dados informados": ecoa apenas os campos que o usuario preencheu. */
function dadosInformados(form: FormState): DadoInformado[] {
  const dados: DadoInformado[] = [
    { label: 'Salário bruto mensal', valor: `R$ ${form.salario}` },
    { label: 'Admissão', valor: form.admissao },
    { label: 'Último dia de trabalho', valor: form.saida },
  ];

  const dependentes = parseInt(form.dependentes, 10);
  if (dependentes > 0) {
    dados.push({ label: 'Dependentes (IRRF)', valor: String(dependentes) });
  }

  const diasFerias = parseInt(form.diasFeriasVencidas, 10);
  if (diasFerias > 0) {
    dados.push({ label: 'Dias de férias vencidas', valor: `${diasFerias} dias` });
  }

  if (form.fgts !== '') {
    dados.push({ label: 'Saldo do FGTS informado', valor: `R$ ${form.fgts}` });
  }

  if (form.tipo === 'pedido_demissao') {
    if (form.empregadorDispensouAviso) {
      dados.push({ label: 'Aviso prévio', valor: 'Dispensado pelo empregador' });
    } else if (form.diasAvisoTrabalhados !== '') {
      dados.push({
        label: 'Dias de aviso trabalhados',
        valor: `${form.diasAvisoTrabalhados} de 30 dias`,
      });
    }
  }

  return dados;
}

/**
 * Demonstrativo de calculo: documento imprimivel (PDF via "salvar como" do
 * navegador) que resume uma rescisao. Fica oculto na tela (display:none) e so
 * aparece na impressao (ver @media print em index.css). E renderizado via portal
 * no body, fora da `.page`, para que `.page { display:none }` na impressao remova
 * todo o resto do fluxo sem gerar paginas em branco.
 */
export function Demonstrativo({ form, view }: Props) {
  const hoje = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const dados = dadosInformados(form);

  return createPortal(
    <section className="demonstrativo" aria-hidden>
      <header className="demo__header">
        <div className="demo__brand">Calculadora de Rescisão CLT</div>
        <h1 className="demo__titulo">Demonstrativo de cálculo de rescisão</h1>
        <p className="demo__meta">
          {view.tipoLabel} &middot; Gerado em {hoje}
        </p>
      </header>

      <section className="demo__bloco">
        <h2 className="demo__bloco-titulo">Dados informados</h2>
        <dl className="demo__dados">
          {dados.map((d) => (
            <div key={d.label}>
              <dt>{d.label}</dt>
              <dd>{d.valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="demo__bloco">
        <h2 className="demo__bloco-titulo">Verbas</h2>
        <table className="demo__tabela">
          <tbody>
            {view.items.map((it) => (
              <tr key={`${it.label}-${it.sub}`}>
                <td>
                  {it.label}
                  <span className="demo__sub">{it.sub}</span>
                </td>
                <td className="demo__val">{it.valorFmt}</td>
              </tr>
            ))}
            <tr className="demo__total">
              <td>Total bruto</td>
              <td className="demo__val">{view.totalBrutoFmt}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {view.temDescontos && (
        <section className="demo__bloco">
          <h2 className="demo__bloco-titulo">Descontos</h2>
          <table className="demo__tabela">
            <tbody>
              {view.descontos.map((d) => (
                <tr key={d.label}>
                  <td>{d.label}</td>
                  <td className="demo__val">- {d.valorFmt}</td>
                </tr>
              ))}
              <tr className="demo__total">
                <td>Líquido estimado</td>
                <td className="demo__val">{view.liquidoFmt}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {view.temSaque && (
        <section className="demo__bloco">
          <h2 className="demo__bloco-titulo">FGTS para saque</h2>
          <table className="demo__tabela">
            <tbody>
              <tr>
                <td>
                  Saldo liberado para saque
                  <span className="demo__sub">
                    seu fundo, sacado à parte; não entra no total acima
                  </span>
                </td>
                <td className="demo__val">{view.saqueFmt}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      <footer className="demo__rodape">
        <p>{view.nota}</p>
        <p>
          Este cálculo é uma estimativa e pode variar em relação ao valor real.
          Gerado em calculorescisaoclt.prsites.com.br
        </p>
      </footer>
    </section>,
    document.body,
  );
}
