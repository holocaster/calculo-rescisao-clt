import { useState } from 'react';
import { FormularioDados } from './ui/FormularioDados';
import { ResultadoRescisao } from './ui/ResultadoRescisao';
import { Demonstrativo } from './ui/Demonstrativo';
import {
  estadoInicial,
  useCalculoRescisao,
  validarFormulario,
  type FormState,
} from './ui/useCalculoRescisao';

// A calculadora é uma ilha React montada no #root. O cabeçalho, o conteúdo de SEO
// (resposta direta, FAQ, tabela) e o rodapé são HTML estático no index.html.
export default function App() {
  const [form, setForm] = useState<FormState>(estadoInicial);
  const update = (patch: Partial<FormState>) =>
    setForm((f) => ({ ...f, ...patch }));
  const view = useCalculoRescisao(form);
  const erros = validarFormulario(form);

  return (
    <>
      <div className="main">
        <FormularioDados
          form={form}
          update={update}
          tipoDesc={view.tipoDesc}
          erros={erros}
        />
        <ResultadoRescisao view={view} />
      </div>
      {view.valid && <Demonstrativo form={form} view={view} />}
    </>
  );
}
