---
status: accepted
---

# Parâmetros legais versionados por vigência

Salário mínimo, tabela de INSS, tabela de IRRF e o redutor da Lei 15.270/2025 são
armazenados como tabelas datadas por vigência. O cálculo seleciona a versão vigente na
**data de desligamento**, não a mais recente.

Optamos por isto em vez de hardcodar os números de 2026 porque os parâmetros mudam todo
ano (e às vezes no meio do ano), e porque calcular rescisões com data passada é caso de uso
real (quem foi demitido meses antes de usar o site). A UI pode começar restrita a 2026, mas
o motor já nasce sem dívida técnica para retroativo e para a virada de ano.

## Consequências

- Lookup de parâmetro sempre recebe uma data de competência.
- Atualização anual é só inserir uma nova linha datada, sem mexer no motor.
