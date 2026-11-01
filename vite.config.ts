import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const src = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': src },
  },
  build: {
    rollupOptions: {
      output: {
        // Шрифты — в fonts/ под своими именами (Inter-Cyrillic-<хэш>.woff2). Хэш оставляем:
        // при обновлении файла браузер не возьмёт старый из кэша
        assetFileNames({ names }) {
          const name = names[0] ?? '';

          return name.endsWith('.woff2')
            ? 'fonts/[name]-[hash][extname]'
            : 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  css: {
    modules: {
      // В SCSS классы в kebab-case, в TSX — styles.titleDone
      localsConvention: 'camelCaseOnly',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/shared/config/tests/setup.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/app/main.tsx',
        'src/**/types.ts',
        'src/**/index.ts',
        'src/shared/config/tests/**',
      ],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
