import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Ayrıştırıcılar `import.meta.glob` ile içeriği yüklüyor; Vite ortamı şart.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
