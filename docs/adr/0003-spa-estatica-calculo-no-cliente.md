---
status: accepted
---

# SPA estática com cálculo no cliente (Vite + React + TS)

A calculadora é uma SPA de página única feita com Vite + React + TypeScript, exportada
como site estático. As regras de cálculo são funções TypeScript puras em `src/dominio`
(sem dependência de React), e rodam no navegador. Não há backend nem banco de dados.

Escolhemos isto após descartar (a) um motor Java com app server-rendered e (b) Next.js.
O cálculo é trivial em CPU, não tem segredo de negócio e não precisa persistir nada: rodar
no cliente dá resposta instantânea, hospedagem estática gratuita, zero operação de servidor
e mantém o dado salarial no navegador (LGPD trivial). React se justifica pela interatividade
condicional do formulário (a modalidade liga/desliga campos e verbas) e recálculo ao vivo;
Next.js seria peso desnecessário para uma única página.

## Consequências

- As regras de negócio, antes prototipadas e testadas em Java, são portadas para TS com a
  mesma bateria de casos (Vitest). A especificação canônica permanece em CONTEXT.md e nos
  ADRs 0001-0002, independente de linguagem.
- `src/dominio` é testável isoladamente, sem montar componentes React.
