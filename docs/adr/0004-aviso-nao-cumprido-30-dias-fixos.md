---
status: accepted
---

# Aviso prévio não cumprido: 30 dias fixos no pedido de demissão

No pedido de demissão, o desconto pelo aviso prévio não cumprido usa **sempre 30 dias**
como base, ignorando o adicional proporcional (3 dias por ano completo, teto 90 — Lei
12.506/2011) que `diasAvisoPrevio` aplica na dispensa pelo empregador.

Desconto = (30 − dias trabalhados) × salário/30. Se o empregador dispensa o cumprimento, o
desconto é zero.

Optamos por isto porque o proporcional beneficia apenas **quem recebe** o aviso, não quem o
**deve**. Quando é o empregado que pede demissão, a obrigação dele é de 30 dias
independentemente do tempo de casa; estender o proporcional ao desconto puniria quem tem mais
tempo de empresa sem amparo legal. A alternativa (reaproveitar `diasAvisoPrevio` para os dois
lados) seria mais simples no código, mas calcularia o desconto errado.

## Consequências

- O motor trata os dois lados do aviso de forma assimétrica: proporcional para o que o
  empregador deve pagar, 30 fixos para o que o empregado deve descontar. Um leitor futuro que
  vir `diasAvisoPrevio` calcular proporcional deve saber que o desconto **não** usa essa função.
- `dias trabalhados` é limitado a 0–30; vazio equivale a 30 (cumpriu integralmente, sem desconto).
- O desconto é abatimento isolado: não entra na base de INSS/IRRF nem projeta avos de 13º/férias.
