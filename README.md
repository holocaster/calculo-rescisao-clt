# Calculadora de Rescisão Trabalhista

SPA estática (Vite + React + TS) que estima as verbas rescisórias de um contrato CLT
urbano padrão. Cálculo roda no navegador; sem backend e sem banco de dados.

## Estrutura

- `src/dominio/` — regras de cálculo em TS puro (sem React), testadas com Vitest
- `src/ui/` — componentes React (formulário, resultado, adaptador do domínio)
- `CONTEXT.md` — glossário do domínio
- `docs/adr/` — decisões de arquitetura
- `design-import/` — handoff de design de referência (não vai para o build)

## Comandos

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm test         # testes do domínio
npm run build    # build estático de produção
```

## Escopo

Cobre CLT urbano padrão nas modalidades sem justa causa, pedido de demissão, justa causa,
acordo mútuo (484-A) e fim de contrato de experiência. Calcula verbas brutas, descontos de
INSS/IRRF 2026 (líquido) e FGTS para saque. Não cobre regimes especiais (doméstico, rural,
aprendiz, intermitente, temporário) nem seguro-desemprego.
