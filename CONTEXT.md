# Rescisão Trabalhista

Calculadora de utilidade pública que estima as verbas devidas no encerramento de um
contrato de emprego regido pela CLT. Cobre apenas o **CLT urbano padrão**: exclui
contratos civis (locação, prestação de serviço), regimes não-CLT (estatutário, PJ) e
regimes especiais (doméstico, rural, aprendiz, intermitente, temporário).

## Language

**Rescisão**:
O encerramento de um contrato de trabalho CLT, com apuração das verbas devidas a uma
das partes. Neste contexto significa SEMPRE rescisão trabalhista.
_Avoid_: "rescisão de contrato" sem qualificador (ambíguo com contrato civil).

**Modalidade**:
A causa jurídica do encerramento (ex.: dispensa sem justa causa, pedido de demissão).
Determina QUAIS verbas são devidas.
_Avoid_: "tipo de rescisão", "motivo".

**Verba rescisória**:
Cada parcela que compõe o total da rescisão (saldo de salário, aviso prévio, 13º
proporcional, férias, multa FGTS, etc.).
_Avoid_: "direito", "benefício".

**Desconto**:
Valor abatido do bruto das verbas (INSS, IRRF, adiantamentos). Reduz o líquido.

**FGTS para saque**:
Saldo do FGTS liberado para o trabalhador sacar (100% / 80% / 0% por modalidade). É o
fundo do trabalhador, exibido à parte — NÃO é verba paga pela empresa nem entra no total.
_Avoid_: confundir com a multa do FGTS (essa é verba paga pela empresa).

### Modalidades cobertas (MVP)

**Sem justa causa**:
Empregador encerra sem motivo legal. Devida a maior cesta de verbas + multa 40% FGTS +
saque + seguro-desemprego.

**Pedido de demissão**:
Empregado encerra. Sem multa FGTS, sem saque, sem seguro-desemprego, sem aviso prévio a
receber (pode haver aviso a descontar se não cumprido).

**Com justa causa**:
Empregador encerra por falta grave do empregado (art. 482). Só saldo de salário e férias
vencidas + 1/3.

**Acordo mútuo** (art. 484-A):
Encerramento consensual. Aviso indenizado pela metade, multa FGTS 20%, saque até 80%,
13º e férias proporcionais integrais, sem seguro-desemprego.

**Experiência**:
Término normal de contrato por prazo determinado (experiência). Sem aviso prévio e sem
multa FGTS; 13º e férias proporcionais devidos; saque do FGTS liberado (100%).

### Aviso prévio e descontos

**Aviso prévio**:
Comunicação antecipada do fim do contrato. Pode ser **trabalhado** (cumprido),
**indenizado** (pago sem trabalho) ou **dispensado**. Indenizado projeta a data de saída
para todos os efeitos (acrescenta avos a 13º e férias).
_Avoid_: "pré-aviso".

**Aviso proporcional**:
Acréscimo de 3 dias por ano completo ao aviso de 30 dias, teto 90 (Lei 12.506/2011).
Só na dispensa pelo empregador.

**Aviso prévio não cumprido**:
No pedido de demissão o empregado deve 30 dias de aviso (sempre 30, sem proporcional — o
proporcional só beneficia quem recebe). Os dias que ele não trabalhar viram **desconto** na
rescisão. É verba a descontar, não a pagar.
_Avoid_: confundir com "aviso prévio indenizado" (esse é pago AO empregado na dispensa).

**Dispensa do aviso (pelo empregador)**:
No pedido de demissão, o empregador pode liberar o empregado de cumprir o aviso. Quando
dispensa, não há desconto pelos dias não trabalhados — mesmo que o empregado tenha cumprido
menos de 30 dias.

**Base tributável**:
Subconjunto das verbas sobre o qual incidem INSS/IRRF (saldo de salário, 13º). Verbas
indenizatórias (aviso indenizado, férias indenizadas, multa FGTS) são isentas.

**Média de variáveis**:
Valor mensal único informado pelo usuário (comissões/HE/adicionais habituais) que soma à
base de 13º, férias e aviso. Não reconstrói histórico mês a mês (decisão de MVP).

### Saída

**Demonstrativo de cálculo**:
Documento imprimível (PDF via "salvar como" do navegador) que resume UMA rescisão: ecoa
os dados informados, lista as verbas e descontos, o total/líquido, o FGTS para saque e o
disclaimer. É um resumo para registro pessoal, NÃO um documento oficial.
_Avoid_: "comprovante" (sugere documento oficial/quitação), "relatório".

## Flagged ambiguities

- **"Rescisão de contrato"** → resolvido para **rescisão trabalhista CLT** (não civil).
