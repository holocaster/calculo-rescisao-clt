import { describe, it, expect } from 'vitest';
import { maskMoeda, parseMoeda } from './mascaras';

describe('maskMoeda', () => {
  it('vazio continua vazio', () => {
    expect(maskMoeda('')).toBe('');
  });

  it('trata os dígitos como centavos', () => {
    expect(maskMoeda('1')).toBe('0,01');
    expect(maskMoeda('12345')).toBe('123,45');
  });

  it('agrupa milhar com ponto', () => {
    expect(maskMoeda('1234567')).toBe('12.345,67');
  });

  it('ignora caracteres não numéricos já digitados', () => {
    expect(maskMoeda('R$ 1.234,56')).toBe('1.234,56');
  });
});

describe('parseMoeda', () => {
  it('converte o texto mascarado em número', () => {
    expect(parseMoeda('12.345,67')).toBe(12345.67);
    expect(parseMoeda('123,45')).toBe(123.45);
  });

  it('vazio vira NaN', () => {
    expect(Number.isNaN(parseMoeda(''))).toBe(true);
  });
});
