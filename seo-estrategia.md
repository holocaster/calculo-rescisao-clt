---
documento: handoff-projeto
titulo: Calculadora de Rescisão CLT — Estratégia de SEO/AEO 2026
objetivo: Servir de contexto e checklist para uma IA otimizar o ranqueamento do site
data: 2026-06-22
publico_alvo: assistente de IA (LLM) que dará continuidade ao trabalho
relacionado: regras-adsense.md (mesmo projeto)
idioma: pt-BR
fontes_pesquisadas: 2025-2026 (dados atuais)
---

# CONTEXTO PARA A IA

Documento complementar ao `regras-adsense.md`. Mesmo projeto: um site com uma
**calculadora de rescisão de contrato CLT**, que será monetizado com anúncios.
Este arquivo trata exclusivamente de **SEO e AEO** — como fazer a página aparecer
no topo das buscas E ser citada pelas IAs de busca.

## A mudança central de 2026 (entenda antes de executar)
A busca virou DOIS jogos simultâneos:
- **SEO** — rankear nos links azuis tradicionais (ainda traz tráfego).
- **AEO/GEO** (Answer/Generative Engine Optimization) — ser **citado dentro das
  respostas de IA**: Google AI Overviews, AI Mode, ChatGPT, Perplexity, Gemini.

Dados que justificam a estratégia:
- A posição #1 perde **~58% dos cliques** quando há um AI Overview na página
  (Ahrefs, dez/2025, 300 mil keywords). Só rankear não basta mais.
- Visitantes vindos de IA convertem **~4,4x mais** e ficam **68% mais tempo** no site.
- **78% dos AI Overviews** contêm uma lista (ordenada ou não).
- Estrutura de headings sequencial aumenta a chance de citação em **2,8x**.

Conclusão para a IA: otimizar para SEO E AEO ao mesmo tempo. As táticas se sobrepõem.

---

# CHECKLIST DE EXECUÇÃO (por ordem de impacto)

## A. Conteúdo e estrutura (maior impacto)
- [x] **Resposta direta nas 3 primeiras linhas** de cada página. Ex.: "A rescisão
      sem justa causa dá direito a saldo de salário, aviso prévio, 13º proporcional,
      férias + 1/3 e multa de 40% do FGTS." → a IA copia como resposta pronta.
- [x] **Cobrir o TÓPICO inteiro** (autoridade tópica), não uma única keyword.
      Criar páginas/seções para: cada tipo de rescisão, aviso prévio proporcional,
      saque do FGTS, seguro-desemprego, 13º e férias proporcionais.
      _(FAQ + tabela cobrem as modalidades, aviso prévio e multa do FGTS; seção "FGTS,
      seguro-desemprego, 13º e férias" (em <details>) cobre os tópicos que faltavam, com
      as 4 perguntas espelhadas no schema FAQPage.)_
- [x] **Headings em formato de pergunta** (H1→H2→H3 sequencial):
      "Quanto recebo na demissão sem justa causa?", "Como calcular o aviso prévio?".
- [x] **Listas e tabelas** sempre que possível (formato favorito das IAs).
      A tabela "tipo de rescisão × verbas" do `regras-adsense.md` é ideal — reutilizar.
- [x] **E-E-A-T / conteúdo de experiência real**: autoria e metodologia transparentes.
      _(Decisão: site de utilidade pública não fabrica autor pessoa-física credenciado —
      seria desonesto e arriscado. E-E-A-T construído por: seção "Como esta calculadora
      estima os valores" (metodologia + fontes legais + data de atualização), autoria a
      nível de Organization no schema, e dois exemplos calculados reais (em <details>
      recolhível) com números gerados pelo próprio domínio.)_
- [x] **Fontes citadas** (CLT, números de artigos de lei) — reforça confiança em nicho YMYL.
      _(Lei 12.506/2011 e art. 484-A citados no conteúdo.)_

## B. Schema markup / dados estruturados
- [x] **FAQPage** — o mais poderoso: gera rich result no Google E citação em IA. Marcar o FAQ.
- [x] **Autoria/E-E-A-T no schema** — `author` e `publisher` (Organization) + `datePublished`,
      `dateModified` e `citation` (CLT, Lei 12.506/2011) no WebApplication. _(Optou-se por
      Organization em vez de Person: não há autor pessoa-física credenciado real.)_
- [x] **Organization** — identidade do site.
- [ ] Validar com a Rich Results Test do Google.
      _(JSON-LD validado como JSON; falta o teste oficial do Google, que exige URL no ar.)_
- [x] (Opcional) **HowTo** / **WebApplication** para a ferramenta, se aplicável.
      _(WebApplication incluído.)_

## C. SEO técnico (crítico — calculadora usa JS)
- [x] **Core Web Vitals 2026** (fator de ranqueamento):
      - LCP < 2,5s _(medido: ~110ms mobile / ~115ms desktop na build de produção local.)_
      - INP < 200ms _(não medível em lab sem interação; bundle leve e cálculo trivial.
        Confirmar com dados de campo/CrUX após publicar.)_
      - CLS < 0,1 _(era 0,31 — a ilha React montava no #root vazio e empurrava o conteúdo.
        Corrigido reservando min-height responsivo no #root; medido 0,00 mobile e desktop.)_
- [x] **Renderização**: se for SPA pesada (React/Vue), crawlers de IA podem não ver o
      conteúdo. Preferir HTML pré-renderizado / SSR / site estático. Site estático resolve.
      _(Conteúdo principal é HTML estático no index.html; a calculadora é ilha React.)_
- [x] **robots.txt** liberando crawlers de IA explicitamente:
      `GPTBot`, `Claude-Web`, `PerplexityBot`, `Google-Extended`. Não bloquear.
- [ ] **Mobile-first** (maioria do tráfego é mobile).
      _(viewport e layout responsivo presentes; falta validar em dispositivos reais.)_
- [ ] **sitemap.xml** + envio no Google Search Console.
      _(sitemap.xml criado; falta enviar ao GSC após publicar.)_
- [ ] **URLs limpas e descritivas** (ex.: /calculadora-rescisao-sem-justa-causa).
- [ ] **HTTPS** obrigatório.
      _(depende da hospedagem na publicação.)_
- [x] **Meta title + meta description** otimizados por página.
- [x] **Open Graph / Twitter cards** para compartilhamento.

## D. Específico do nicho trabalhista (YMYL)
- [x] Conteúdo "Your Money or Your Life" → barra de qualidade mais alta do Google.
      Reforçar autoria, fontes legais e disclaimer.
      _(fontes legais, disclaimer, metodologia transparente e autoria a nível de
      Organization feitos. Trust priorizado em vez de credencial fabricada — ver E-E-A-T.)_
- [x] Concorrência forte (JusBrasil, sites de advocacia). Diferencial = **ferramenta
      interativa + conteúdo direto e simples**, algo que os grandes fazem mal.
- [x] Disclaimer de "valores estimados" (também protege juridicamente — ver regras-adsense.md).

---

# RESUMO DA ESTRATÉGIA EM 1 FRASE
Página rápida e em HTML legível por crawlers, com resposta direta no topo, conteúdo
que cobre todo o tema da rescisão CLT, headings em forma de pergunta, listas/tabelas,
e schema FAQPage — para rankear no Google E ser citada pelas IAs de busca.

---

# FONTES (pesquisa 2025–2026)
- Answer Engine Optimization: Complete AEO Guide 2026 — https://www.frase.io/blog/what-is-answer-engine-optimization-the-complete-guide-to-getting-cited-by-ai
- AEO 2026 Practical Playbook — https://almcorp.com/blog/answer-engine-optimization-2026/
- How to Rank in AI Overviews: 12 Strategies 2026 — https://seoprofy.com/blog/how-to-rank-in-ai-overviews/
- Google's Guide to Optimizing for Generative AI Features — https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- AI Features and Your Website (Google) — https://developers.google.com/search/docs/appearance/ai-features
- Technical SEO Checklist 2026 (Core Web Vitals, Schema, JS, INP) — https://itdgrowthlabs.com/resources/Technical_SEO_Checklist_2026_Core_Web_Vitals_Schema_JS_Rendering.php
- SEO Trends 2026: Google AI Overviews & ChatGPT Citations — https://almcorp.com/blog/seo-trends-2026-rank-google-ai-search/

*Confira sempre a documentação oficial atualizada do Google Search Central.*
