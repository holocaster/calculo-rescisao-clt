# Calculadora de Rescisão Trabalhista CLT

SPA estática (Vite + React 19 + TS) que estima verbas rescisórias de um contrato CLT
urbano padrão. Cálculo roda no navegador; sem backend nem banco. Monetização por anúncios
(hoje desligados) e foco em SEO/AEO.

## Arquitetura

- `src/dominio/` — regras de cálculo em TS puro, sem React. Testado com Vitest.
- `src/ui/` — componentes React (formulário, resultado, adaptador `useCalculoRescisao`).
- `index.html` — conteúdo de SEO (H1, resposta direta, FAQ, tabela, schema JSON-LD) em
  HTML estático. A calculadora é uma **ilha React** montada no `#root`; `App.tsx` renderiza
  só formulário + resultado. Cabeçalho/conteúdo/rodapé são estáticos no `index.html`.
- `CONTEXT.md` — glossário do domínio (fonte da linguagem; consultar antes de nomear).
- `docs/adr/` — decisões de arquitetura (ler antes de mexer na área correspondente).

## Comandos

```bash
npm run dev      # desenvolvimento
npm test         # testes do domínio (Vitest)
npm run build    # tsc -b && vite build (build estático em dist/)
npm run lint     # eslint
```

Sempre validar com `npm test`, `npm run build` e `npm run lint` antes de concluir.

**Antes de cada commit/push:** subir a versão em `package.json` (SemVer) e registrar as
mudanças no `CHANGELOG.md`.

## Escopo do cálculo

Modalidades: sem justa causa, pedido de demissão, justa causa, acordo (484-A) e fim de
experiência. Calcula verbas brutas, descontos de INSS/IRRF 2026 (líquido) e FGTS para saque.
Não cobre regimes especiais (doméstico, rural, aprendiz, intermitente, temporário) nem
seguro-desemprego. Resultados são **estimativas** (há disclaimer na página).

## Convenções e pontos de atenção

- Domínio é a fonte da verdade dos cálculos; UI só adapta. Regras novas entram com TDD.
- Tabelas legais (INSS/IRRF/salário mínimo) são versionadas por vigência — ver ADR 0002.
- Aviso prévio não cumprido (pedido de demissão) usa 30 dias fixos — ver ADR 0004.
- Anúncios: flag `ANUNCIOS_ATIVOS` em `src/ui/EspacoAnuncio.tsx` (hoje `false`).
- Valores monetários usam máscara pt-BR (`src/ui/mascaras.ts`).
- Baseline de verificação com dados reais: teste "regressão com TRCT real (Banco Pan...)"
  em `calculadora.test.ts` (pedido de demissão, admissão 13/07/2021, saída 19/02/2026,
  salário 15.246,19 → 13º 2/12 = 2.541,03; férias prop. 7/12 = 8.893,61 + 1/3 2.964,54;
  férias vencidas 15 dias = 10.164,12). Médias de variáveis (HE, sobreaviso) e PLR ficam
  fora do escopo e explicam diferenças de INSS/IRRF/saldo num TRCT real.

## SEO

- Domínio de produção: `https://calculorescisaoclt.prsites.com.br` (sincronizar em
  `index.html`, `public/robots.txt`, `public/sitemap.xml`).
- `seo-estrategia.md` — checklist de SEO/AEO com o status do que já foi feito.
- Schema JSON-LD (WebApplication, Organization, FAQPage) vive no `<head>` do `index.html`.
