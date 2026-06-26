# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/);
versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [0.3.0] - 2026-06-26

### Adicionado
- Demonstrativo de cálculo imprimível: botão "Imprimir / Salvar PDF" no resultado gera um
  documento (via "salvar como PDF" do navegador) com os dados informados, as verbas,
  os descontos/líquido, o FGTS para saque e o disclaimer. O restante da página é ocultado
  na impressão via `@media print`.

## [0.2.0] - 2026-06-24

### Adicionado
- Memória de cálculo por verba: dias trabalhados, avos, base e percentuais agora aparecem
  na sub-legenda de cada verba a receber.
- 1/3 constitucional das férias exibido em linha própria (proporcionais e vencidas).
- Descontos de INSS e IRRF do 13º separados dos do saldo de salário.
- Detalhe do aviso prévio indenizado com a composição legal: `30 + 3 dias/ano x N anos`.
- Teste de regressão com dados reais de um TRCT (Banco Pan).

### Corrigido
- Avos do 13º proporcional passam a considerar a data de admissão (antes contava sempre
  desde janeiro, inflando os avos em admissões no mesmo ano civil — afetava Experiência e
  contratos curtos).

### Corrigido (texto)
- Acento em "usufruído" na dica de férias vencidas.

## [0.1.0] - 2026-06

### Adicionado
- Calculadora de rescisão CLT (Vite + React + TS) com conteúdo SEO/AEO.
