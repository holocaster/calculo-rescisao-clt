---
documento: handoff-projeto
titulo: Calculadora de Rescisão CLT — Regras AdSense e Contexto do Projeto
objetivo: Servir de contexto para uma IA continuar o desenvolvimento do projeto
data: 2026-06-22
publico_alvo: assistente de IA (LLM) que dará continuidade ao trabalho
idioma: pt-BR
---

# CONTEXTO PARA A IA

Você está assumindo um projeto em andamento. Leia este documento inteiro antes de agir.

## O que é o projeto
- Um site com uma **calculadora de rescisão de contrato CLT** (verbas rescisórias).
- O autor já tem **algo parcialmente montado** (a calculadora em si existe, em estado inicial).
- A intenção é **publicar o site e monetizar com Google AdSense**. Objetivo secundário,
  exploratório ("se der dinheiro, ok"), mas o site deve ser genuinamente útil.

## Por que este documento existe
- O autor lembrou que o AdSense tem regras de aprovação e quase as ignorou.
- Este arquivo resume **as regras do AdSense** + **as pendências do projeto** para que
  você (IA) saiba o que falta fazer antes de o site poder receber anúncios.

## O que a IA deve fazer ao continuar
1. Verificar o estado atual do código da calculadora (peça o caminho dos arquivos ao autor se não souber).
2. Garantir que os **requisitos de aprovação do AdSense** (seção "PENDÊNCIAS") estejam atendidos.
3. Validar a **correção dos cálculos** (seção "REGRAS DE CÁLCULO CLT").
4. NÃO posicionar anúncios colados em botões (causa banimento — ver seção "POSICIONAMENTO").

---

# PENDÊNCIAS DO PROJETO (checklist para a IA)

Antes de submeter ao AdSense, o site precisa ter:

- [ ] **Conteúdo além da calculadora** — AdSense rejeita sites "só ferramenta".
      Criar: artigo explicando tipos de rescisão + FAQ de verbas rescisórias.
- [ ] **Política de Privacidade** (obrigatória — AdSense + LGPD).
- [ ] **Termos de Uso** (recomendado).
- [ ] **Página de Contato / Sobre** (aumenta confiança na aprovação).
- [ ] **Disclaimer jurídico** na calculadora ("valores estimados, consulte um profissional").
- [ ] **Banner de consentimento de cookies (CMP)** — LGPD/GDPR. Usar a CMP gratuita do próprio AdSense.
- [ ] **Domínio próprio** (não apenas subdomínio gratuito).
- [ ] **Navegação/menu** funcional, sem links quebrados.
- [ ] Anúncios posicionados com **espaço seguro** longe de botões/campos.

---

# REGRAS DO GOOGLE ADSENSE

## 1. Pré-requisitos de aprovação
- Site no ar, navegável, sem páginas "em construção".
- Conteúdo próprio e útil (não basta a ferramenta).
- Domínio próprio ajuda. Conta exige autor 18+.

## 2. Páginas legais obrigatórias
- **Política de Privacidade** mencionando: cookies do Google/parceiros, cookie DART,
  anúncios personalizados e como o usuário desativa (link p/ config de anúncios do Google).
- **Termos de Uso** e **Contato/Sobre** recomendados.
- **LGPD**: deixar claro que os cálculos rodam no navegador e nada é armazenado (se for o caso).

## 3. Consentimento de cookies (CMP)
- Para BR (LGPD) e Europa (GDPR) é exigida uma **CMP certificada**.
- O AdSense oferece uma CMP gratuita: painel → *Privacidade e mensagens*.

## 4. Posicionamento de anúncios — PROIBIÇÕES (causa de banimento)
- ❌ Anúncio colado em botão/campo (ex.: botão "Calcular") → cliques acidentais → suspensão.
- ❌ Pedir cliques ("clique nos anúncios", "apoie clicando").
- ❌ Clicar nos próprios anúncios ou pedir para terceiros clicarem.
- ❌ Setas/imagens apontando para anúncios.
- ❌ Disfarçar anúncio de conteúdo ou de resultado do cálculo.
- ❌ Anúncio em pop-up/e-mail/app não autorizado.
- ❌ Excesso de anúncios sufocando o conteúdo.
- ✅ Espaço claro entre o resultado do cálculo e o anúncio.

## 5. Conteúdo proibido
- Adulto, violento, discurso de ódio, enganoso, pirataria, hacking.
- Conteúdo copiado (violação de direitos autorais) — reescrever textos de leis comentadas.

## 6. Tráfego válido
- Apenas tráfego orgânico/real. Proibido: comprar tráfego/cliques, bots, troca de cliques, tráfego incentivado.

## 7. Específico do nicho trabalhista
- Disclaimer obrigatório: não é aconselhamento jurídico oficial.
- Nicho jurídico costuma ter **RPM alto** (advogados/fintechs/bancos anunciam bem) → vale conteúdo de qualidade.

---

# REGRAS DE CÁLCULO CLT (validar a corretude da calculadora)

A calculadora deve tratar **o tipo de rescisão**, pois cada um libera verbas diferentes:

| Tipo de rescisão | Aviso prévio | 13º prop. | Férias prop.+1/3 | Multa 40% FGTS | Saca FGTS | Seguro-desemprego |
|---|---|---|---|---|---|---|
| Demissão sem justa causa | Sim (recebe) | Sim | Sim | Sim (40%) | Sim | Sim |
| Pedido de demissão | Sim (desconta se não cumprir) | Sim | Sim | Não | Não | Não |
| Justa causa | Não | Não | Não (só vencidas) | Não | Não | Não |
| Acordo (art. 484-A) | Metade | Sim | Sim | 20% | 80% | Não |
| Fim de contrato determinado | Não | Sim | Sim | Não (regra geral) | Sim | Não |

Verbas e regras de cálculo:
- **Saldo de salário**: dias trabalhados no mês ÷ 30 × salário.
- **Aviso prévio**: 30 dias + **3 dias por ano completo** trabalhado, **teto de 90 dias**.
- **13º proporcional**: meses trabalhados no ano (≥15 dias = mês cheio) ÷ 12 × salário.
- **Férias vencidas** (se houver) + **férias proporcionais** + **1/3 constitucional** sobre ambas.
- **Multa FGTS**: 40% (sem justa causa) ou 20% (acordo 484-A) sobre o saldo do FGTS.
- Considerar **descontos** (INSS, IRRF) sobre as verbas tributáveis quando aplicável.
- Incluir **disclaimer** de valores estimados.

> Atenção: confirmar alíquotas/tetos vigentes de INSS e IRRF na data de implementação.

---

# PASSO A PASSO DE PUBLICAÇÃO (ordem sugerida)

1. Adicionar conteúdo (artigo + FAQ) além da calculadora.
2. Criar Política de Privacidade, Termos e Contato.
3. Publicar em domínio próprio.
4. Criar conta AdSense → adicionar site → colar script de verificação.
5. Aguardar análise (dias a ~2 semanas).
6. Ativar CMP de consentimento.
7. Após aprovação, inserir blocos de anúncio com bom espaçamento.

# ALTERNATIVAS DE MONETIZAÇÃO (quando houver tráfego)
- **Ezoic** — aceita sites menores, paga mais que AdSense.
- **Raptive / Mediavine** — pagam muito mais, exigem volume (Mediavine ~50 mil sessões/mês).
- Combinar com **afiliados** (cursos/plataformas jurídicas) e produto próprio (ebook de direitos).

---

*Referência oficial e sempre atualizada: https://support.google.com/adsense*
