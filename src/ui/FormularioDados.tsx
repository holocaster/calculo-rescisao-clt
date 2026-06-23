import { tipoOptions } from './labels';
import { maskMoeda } from './mascaras';
import {
  maskData,
  type ErrosFormulario,
  type FormState,
} from './useCalculoRescisao';

interface Props {
  form: FormState;
  update: (patch: Partial<FormState>) => void;
  tipoDesc: string;
  erros: ErrosFormulario;
}

export function FormularioDados({ form, update, tipoDesc, erros }: Props) {
  return (
    <section className="card form">
      <h2 className="form__title">Seus dados</h2>
      <p className="form__subtitle">Preencha para ver o cálculo automaticamente.</p>

      <div className="field">
        <label className="field__label" htmlFor="tipo">
          Motivo da saída
        </label>
        <div className="select-wrap">
          <select
            id="tipo"
            className="input select"
            value={form.tipo}
            onChange={(e) => update({ tipo: e.target.value as FormState['tipo'] })}
          >
            {tipoOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <p className="field__hint">{tipoDesc}</p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="salario">
          Salário bruto mensal
        </label>
        <div className="input-prefix">
          <span className="input-prefix__sign">R$</span>
          <input
            id="salario"
            className="input input--prefixed"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={form.salario}
            onChange={(e) => update({ salario: maskMoeda(e.target.value) })}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field__label" htmlFor="admissao">
            Data de admissão
          </label>
          <input
            id="admissao"
            className={'input' + (erros.admissao ? ' input--erro' : '')}
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="dd/mm/aaaa"
            aria-invalid={!!erros.admissao}
            value={form.admissao}
            onChange={(e) => update({ admissao: maskData(e.target.value) })}
          />
          {erros.admissao && <p className="field__erro">{erros.admissao}</p>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="saida">
            Último dia de trabalho
          </label>
          <input
            id="saida"
            className={'input' + (erros.saida ? ' input--erro' : '')}
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="dd/mm/aaaa"
            aria-invalid={!!erros.saida}
            value={form.saida}
            onChange={(e) => update({ saida: maskData(e.target.value) })}
          />
          {erros.saida && <p className="field__erro">{erros.saida}</p>}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field__label" htmlFor="fgts">
            Saldo do FGTS (opcional)
          </label>
          <div className="input-prefix">
            <span className="input-prefix__sign">R$</span>
            <input
              id="fgts"
              className="input input--prefixed"
              type="text"
              inputMode="decimal"
              placeholder="estimado se vazio"
              value={form.fgts}
              onChange={(e) => update({ fgts: maskMoeda(e.target.value) })}
            />
          </div>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="dependentes">
            Dependentes (IRRF)
          </label>
          <input
            id="dependentes"
            className="input"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            placeholder="0"
            value={form.dependentes}
            onChange={(e) => update({ dependentes: e.target.value })}
          />
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="diasFeriasVencidas">
          Dias de férias vencidas a receber
        </label>
        <input
          id="diasFeriasVencidas"
          className="input"
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          placeholder="0"
          value={form.diasFeriasVencidas}
          onChange={(e) => update({ diasFeriasVencidas: e.target.value })}
        />
        <p className="field__hint">
          Um período de 12 meses não usufruido vale 30 dias. Se você já tirou parte das
          férias (fracionamento), informe apenas o saldo de dias que ainda falta usufruir.
        </p>
      </div>

      {form.tipo === 'pedido_demissao' && (
        <div className="field">
          <label className="field__label" htmlFor="diasAvisoTrabalhados">
            Dias de aviso prévio trabalhados
          </label>
          <input
            id="diasAvisoTrabalhados"
            className="input"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            max="30"
            placeholder="30"
            disabled={form.empregadorDispensouAviso}
            value={form.diasAvisoTrabalhados}
            onChange={(e) => update({ diasAvisoTrabalhados: e.target.value })}
          />
          <p className="field__hint">
            No pedido de demissão o aviso é de 30 dias. Os dias não trabalhados são
            descontados da rescisão. Em branco assume que você cumpriu os 30 dias.
          </p>
          <label className="field__check">
            <input
              type="checkbox"
              checked={form.empregadorDispensouAviso}
              onChange={(e) => update({ empregadorDispensouAviso: e.target.checked })}
            />
            <span>Empregador dispensou o aviso (sem desconto)</span>
          </label>
        </div>
      )}
    </section>
  );
}
