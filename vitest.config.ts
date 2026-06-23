import { defineConfig } from 'vitest/config'

// Testes do domínio: TS puro em ambiente node, sem plugin de UI.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
