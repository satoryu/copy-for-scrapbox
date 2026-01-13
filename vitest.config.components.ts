import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Separate config for component tests to avoid WXT/esbuild/jsdom conflicts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.components.ts'],
    include: [
      'entrypoints/**/*.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'entrypoints/**/components/**/*.{ts,tsx}',
        'entrypoints/**/App.{ts,tsx}',
        'entrypoints/**/hooks/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/**',
        '.output/**',
        '.wxt/**',
        '**/*.config.ts',
        '**/*.config.js',
        '**/dist/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/main.tsx', // Entry point files
        '**/hooks/**', // Hooks tested indirectly through component tests
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
