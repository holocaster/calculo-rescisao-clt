// Máscaras de entrada (sem dependência de React).

/** Formata os dígitos como moeda pt-BR (centavos): "12345" -> "123,45". */
export function maskMoeda(valor: string): string {
  const digitos = valor.replace(/\D/g, '');
  if (digitos === '') return '';
  const numero = parseInt(digitos, 10) / 100;
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Converte o texto mascarado ("12.345,67") em número (12345.67). Vazio -> NaN. */
export function parseMoeda(valor: string): number {
  if (valor === '') return NaN;
  return parseFloat(valor.replace(/\./g, '').replace(',', '.'));
}
