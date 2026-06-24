import type { ResultadoView } from './useCalculoRescisao';
import { EspacoAnuncio } from './EspacoAnuncio';

interface Props {
  view: ResultadoView;
}

export function ResultadoRescisao({ view }: Props) {
  return (
    <aside className="resultado-col">
      {view.valid ? (
        <div className="resultado">
          <div className="resultado__topo">
            <span className="resultado__label">Você tem a receber</span>
            <strong className="resultado__total">{view.totalBrutoFmt}</strong>
            <span className="resultado__sub">{view.tipoLabel} — valor bruto</span>
          </div>

          <ul className="verbas">
            {view.items.map((it) => (
              <li className="verba" key={`${it.label}-${it.sub}`}>
                <div className="verba__info">
                  <span className="verba__label">{it.label}</span>
                  <span className="verba__sub">{it.sub}</span>
                </div>
                <span className="verba__valor">{it.valorFmt}</span>
              </li>
            ))}
          </ul>

          {view.temDescontos && (
            <details className="descontos">
              <summary className="descontos__summary">
                Ver com descontos (INSS / IRRF)
              </summary>
              <div className="descontos__body">
                {view.descontos.map((d) => (
                  <div className="descontos__linha" key={d.label}>
                    <span>{d.label}</span>
                    <span>- {d.valorFmt}</span>
                  </div>
                ))}
                <div className="descontos__linha descontos__linha--liquido">
                  <span>Líquido estimado</span>
                  <span>{view.liquidoFmt}</span>
                </div>
              </div>
            </details>
          )}
        </div>
      ) : (
        <div className="resultado-vazio">
          <span className="resultado-vazio__icone" aria-hidden>
            🧮
          </span>
          <p className="resultado-vazio__texto">Preencha seus dados</p>
        </div>
      )}

      {view.valid && view.temSaque && (
        <div className="fgts-card">
          <span className="fgts-card__titulo">FGTS liberado para saque</span>
          <strong className="fgts-card__valor">{view.saqueFmt}</strong>
          <span className="fgts-card__nota">
            É o seu fundo, sacado à parte — não entra no total acima.
          </span>
        </div>
      )}

      {view.valid && <p className="nota">{view.nota}</p>}

      <EspacoAnuncio size="retangulo" />
    </aside>
  );
}
