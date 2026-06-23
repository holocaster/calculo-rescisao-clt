---
status: accepted
---

# Cálculo juridicamente preciso por padrão

A calculadora aplica as regras trabalhistas como na homologação oficial — projeção do
aviso prévio indenizado na data de saída (acréscimo de avos a 13º e férias), incidência
correta de INSS/IRRF apenas sobre verbas tributáveis (saldo de salário e 13º), com isenção
das verbas indenizatórias, e valor líquido final. A multa de FGTS usa saldo estimado
(8% × salário × meses) com override manual, já que não há acesso ao extrato real.

Escolhemos precisão sobre o atalho "bruto simplificado" dos concorrentes porque é o que dá
credibilidade a uma ferramenta de utilidade pública e evita subestimar o valor devido. O
custo aceito é maior complexidade do motor e o compromisso de manter as regras fiscais
atualizadas.

## Consequências

- Motor precisa modelar incidência por verba, não um percentual global.
- A estimativa de FGTS deve ser rotulada como aproximação na UI.
