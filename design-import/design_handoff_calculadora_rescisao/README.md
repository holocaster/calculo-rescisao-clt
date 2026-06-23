# Handoff: Calculadora de Rescisão de Contrato (CLT)

## Visão geral
Site de uma página que calcula as verbas rescisórias de um trabalhador CLT no Brasil. O usuário informa o motivo da saída, salário e datas, e o cálculo do total a receber aparece automaticamente. O layout tem espaços reservados para banners de anúncio (monetização).

## Sobre os arquivos de design
Os arquivos `.dc.html` neste pacote são **referências de design feitas em HTML** — protótipos que mostram a aparência e o comportamento pretendidos, **não código de produção para copiar diretamente**. A tarefa é **recriar este design no ambiente do codebase de destino** (React, Vue, Next.js, etc.) usando os padrões e bibliotecas já estabelecidos. Se ainda não houver um codebase, escolha o framework mais adequado (sugestão: React + Vite, ou Next.js se for indexar no Google para SEO) e implemente lá.

> Observação técnica: os arquivos usam um runtime de protótipo (`<x-dc>`, `dc-import`, `support.js`). **Ignore esse runtime.** Toda a lógica de cálculo está em JavaScript puro dentro da classe `Component` em `RescisaoCalc.dc.html` e é diretamente portável. A "engine de cálculo" é o que importa — a marcação é só a camada visual.

## Fidelidade
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos e interações são finais. Recrie a UI fielmente usando as bibliotecas/design system do codebase. Se o projeto já tem um design system, adapte os tokens abaixo aos equivalentes dele.

## Arquitetura
- **`RescisaoCalc.dc.html`** — o componente completo: UI + engine de cálculo. Tem uma prop `variant` (`"classico"` | `"destaque"`) que muda só a apresentação do resultado.
- **`Calculadora de Rescisão.dc.html`** — a página final do site, que renderiza o `RescisaoCalc` com `variant="destaque"` em tela cheia. **Esta é a versão escolhida para produção.**

Sugestão de componentes no codebase:
- `<CalculadoraRescisao />` — página/container.
- `<FormularioDados />` — formulário de entrada.
- `<ResultadoRescisao />` — painel de resultado (variante "destaque").
- `<EspacoAnuncio size="leaderboard" | "retangulo" />` — slot de banner.
- `hooks/useCalculoRescisao.ts` — a engine de cálculo pura (ver seção "Engine de cálculo").

## Telas / Views
Página única, responsiva, **mobile-first**. Em telas largas (~≥720px) vira duas colunas; em telas estreitas as colunas empilham (formulário em cima, resultado embaixo).

Estrutura de cima para baixo:
1. **Header** (faixa azul).
2. **Banner leaderboard** (728×90).
3. **Main** — duas colunas: formulário (esquerda) e resultado + banner retângulo (direita, `position: sticky`).
4. **Footer** — aviso legal.

### 1. Header
- Fundo `#1f5fd6`, texto branco, padding `22px 24px`, conteúdo centralizado com `max-width: 1040px`.
- Ícone: quadrado `42×42px`, `border-radius: 11px`, fundo `rgba(255,255,255,.16)`, texto "R$" em `800`/`18px`.
- Título "Calculadora de Rescisão" — `20px`/`800`, `letter-spacing: -0.01em`.
- Subtítulo "Descubra quanto você tem a receber — de forma simples" — `13.5px`/`500`, `opacity: .82`.

### 2. Banner leaderboard (slot de anúncio)
- Faixa de fundo `#e6ecf6`, borda inferior `#dde4ef`, padding `16px 24px`.
- Slot: `width: 100%; max-width: 728px; height: 90px`, borda `1.5px dashed #b9c4d6`, `border-radius: 8px`, fundo `#f3f6fb`, centralizado.
- Conteúdo placeholder (substituir pelo código de anúncio, ex.: Google AdSense): texto em fonte monospace.

### 3. Formulário (coluna esquerda)
- Card branco, borda `1px solid #e4e9f2`, `border-radius: 18px`, padding `26px`, sombra `0 1px 2px rgba(20,35,70,.04)`.
- `flex: 1.6 1 380px`.
- Título "Seus dados" (`17px`/`800`) + subtítulo (`13.5px`, `#7c889c`).

**Campos** (todos com label `13.5px`/`700`, cor `#2b3a55`, `margin-bottom: 7px`):

| Campo | Tipo | Detalhes |
|---|---|---|
| Motivo da saída | `<select>` | 5 opções (ver Engine). Chevron azul customizado à direita. Abaixo: caixa de descrição contextual (`#f4f7fc`, `12.5px`). |
| Salário bruto mensal | `number` | Prefixo "R$" absoluto à esquerda (padding-left 42px), `step=0.01`. |
| Data de admissão | `date` | — |
| Último dia de trabalho | `date` | Lado a lado com admissão (`flex` wrap, gap 16px). |
| Saldo do FGTS (opcional) | `number` | Prefixo "R$". Helper: estimativa se vazio. |
| Férias vencidas | `checkbox` | Linha clicável com fundo `#f7f9fc`, borda `#e8edf5`, `border-radius: 11px`. `accent-color: #1f5fd6`. |

Estilo dos inputs: `padding: 13px 14px`, borda `1px solid #d6deec`, `border-radius: 11px`, `font-size: 16px` (evita zoom no iOS), fundo branco.
Estado de foco: `border-color: #1f5fd6; box-shadow: 0 0 0 3px rgba(31,95,214,.14)`.

### 4. Resultado — variante "destaque" (coluna direita, sticky `top: 24px`)
- `flex: 1 1 300px; max-width: 344px`.
- Painel principal: `background: linear-gradient(160deg, #2161db, #163e98)`, `border-radius: 18px`, sombra `0 10px 30px rgba(22,62,152,.28)`, texto branco.
  - Topo (padding `24px 22px 20px`): label "Você tem a receber" (`12.5px`/`700`, uppercase, `letter-spacing: .05em`, `opacity: .78`); **total** em `38px`/`800`, `letter-spacing: -0.02em`; subtítulo com o nome do motivo (`13px`, `opacity: .8`).
  - Lista de verbas (fundo `rgba(255,255,255,.08)`): cada linha tem label (`13.5px`/`600`) + sublinha explicativa (`11px`, `opacity: .62`) à esquerda, e valor (`14.5px`/`700`) à direita. Divisória `1px solid rgba(255,255,255,.12)`.
- **Card FGTS para saque** (quando aplicável): fundo `#ecf8f1`, borda `#cdebd9`, `border-radius: 13px`. Título verde `#157a4a`, valor `16px`/`800`. Mostra o FGTS liberado para saque, **separado do total** (é o fundo do trabalhador, não verba paga pela empresa).
- **Nota contextual** (`#f4f7fc`, `12.5px`, `#7c889c`): texto específico de cada motivo de saída.
- **Estado vazio** (sem dados válidos): card branco com borda tracejada `1.5px dashed #cfd8e6`, ícone 🧮, "Preencha seus dados".
- **Banner retângulo** (300×250): mesmo estilo placeholder do leaderboard, abaixo do resultado.

### 5. Footer
- `max-width: 1040px`, borda superior `1px solid #e2e8f2`, texto `12px`, cor `#9aa5b8`.
- Aviso: valores brutos e estimados, sem INSS/IRRF; FGTS estimado em 8%/mês quando não informado; recomenda confirmar com contador/advogado.

## Interações & Comportamento
- **Cálculo ao vivo**: recalcula a cada mudança de qualquer campo (sem botão "Calcular"). Enquanto salário ≤ 0 ou datas inválidas/saída ≤ admissão → mostra o estado vazio.
- **Responsivo**: layout em `flex-wrap`; colunas empilham automaticamente em telas estreitas (sem media query — `flex: 1.6 1 380px` / `flex: 1 1 300px`).
- **Sticky**: a coluna de resultado acompanha o scroll no desktop.

## State Management
Estado do formulário (5 campos + 1 boolean):
```
{ tipo: string, salario: string, admissao: string (yyyy-mm-dd),
  saida: string (yyyy-mm-dd), fgts: string, feriasVencidas: boolean }
```
Tudo o mais (itens, total, FGTS para saque) é **derivado** desse estado — calcule no render / `useMemo`, não armazene.

## Engine de cálculo (o mais importante)
Lógica em JS puro, portável direto. Regras por tipo de rescisão:

```js
const rulesMap = {
  sem_justa_causa: { aviso:'full', decimo:true,  feriasProp:true,  multa:0.40, saque:1   },
  acordo:          { aviso:'half', decimo:true,  feriasProp:true,  multa:0.20, saque:0.8 },
  pedido_demissao: { aviso:'none', decimo:true,  feriasProp:true,  multa:0,    saque:0   },
  justa_causa:     { aviso:'none', decimo:false, feriasProp:false, multa:0,    saque:0   },
  experiencia:     { aviso:'none', decimo:true,  feriasProp:true,  multa:0,    saque:1   },
};
```

Cálculo de cada verba (salário = salário bruto mensal):
- **Saldo de salário** = `(salario/30) * (dia do mês do último dia)`. Sempre.
- **Aviso prévio indenizado** (se `aviso !== 'none'`): `dias = min(90, 30 + 3 * anosCompletos)`; valor = `(salario/30) * dias * fator` (fator 1 para `full`, 0.5 para `half`).
- **13º proporcional** (se `decimo`): `(salario/12) * avos`, onde `avos = countAvos(início, saída)`, início = `max(admissão, 1º de janeiro do ano da saída)`.
- **Férias proporcionais + 1/3** (se `feriasProp`): `(salario/12) * avos * (4/3)`, avos contados do último aniversário de admissão até a saída.
- **Férias vencidas + 1/3** (se `feriasVencidas` marcado): `salario * (4/3)` (um período). Vale para todos os tipos, inclusive justa causa.
- **Multa do FGTS** (se `multa > 0`): `fgtsTotal * multa`.
- **Total** = soma de tudo acima.
- **FGTS para saque** (se `saque > 0`): `fgtsTotal * saque` — exibido à parte, **não somado ao total**.

Onde `fgtsTotal = fgts informado` ou, se vazio, `0.08 * salario * mesesTotais` (estimativa).

**Função de avos** (conta meses com ≥15 dias trabalhados, máx. 12):
```js
function countAvos(start, end){
  if(!start || !end || end < start) return 0;
  let count = 0, y = start.getFullYear(), m = start.getMonth();
  while(y < end.getFullYear() || (y === end.getFullYear() && m <= end.getMonth())){
    const mStart = new Date(y, m, 1), mEnd = new Date(y, m + 1, 0);
    const ws = mStart < start ? start : mStart;
    const we = mEnd > end ? end : mEnd;
    const days = Math.round((we - ws) / 86400000) + 1;
    if(days >= 15) count++;
    m++; if(m > 11){ m = 0; y++; }
  }
  return Math.min(count, 12);
}
```

Opções do select (`value` → label) e textos de descrição/nota por tipo: **copiar verbatim de `RescisaoCalc.dc.html`** (objetos `tipoOptions` e `meta` no método `renderVals`).

Formatação de moeda: `valor.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })`.

## Design Tokens
**Cores**
- Primária / azul: `#1f5fd6`
- Azul escuro (gradiente painel): `#2161db` → `#163e98`
- Tinta/texto principal: `#13203a`
- Texto secundário: `#2b3a55`, `#7c889c`, `#9aa5b8`
- Fundo da página: `#eef2f8`
- Card branco: `#ffffff`; bordas: `#e4e9f2`, `#d6deec`
- Verde FGTS: `#157a4a` (texto), `#ecf8f1` (fundo), `#cdebd9` (borda)
- Faixa de banner: `#e6ecf6`; placeholder: `#f3f6fb` + borda tracejada `#b9c4d6`

**Tipografia**: família **Public Sans** (Google Fonts), pesos 400/500/600/700/800.
Escala usada: 11–12px (notas), 13–14px (corpo/label), 17px (subtítulo), 20px (título), 22–38px (total).

**Raio de borda**: 8px (banner), 11px (inputs/notas), 13px (cards menores), 18px (cards principais).

**Sombras**: cards `0 1px 2px rgba(20,35,70,.04)`; resultado `0 6px 24px rgba(20,35,70,.07)` (clássico) / `0 10px 30px rgba(22,62,152,.28)` (destaque).

**Espaçamento**: base 4px; gaps comuns 16/20/24px; padding de card 24/26px.

## Banners / Monetização
Dois slots placeholder a serem trocados pelo código real da rede de anúncios (ex.: Google AdSense):
- **Leaderboard 728×90** — topo, abaixo do header.
- **Retângulo 300×250** — lateral direita (mobile: abaixo do resultado).
Mantenha-os em containers responsivos (`max-width` + centralizado) e considere `responsive ad units` para mobile.

## Assets
Nenhum asset externo além da fonte **Public Sans** (Google Fonts) e um chevron SVG inline no select. Sem imagens/logos — o "logo" é um quadrado com "R$" (substitua por uma marca se desejar).

## Arquivos neste pacote
- `RescisaoCalc.dc.html` — componente completo (UI + engine). Fonte de verdade para a lógica.
- `Calculadora de Rescisão.dc.html` — página final (variante "destaque" em tela cheia).
