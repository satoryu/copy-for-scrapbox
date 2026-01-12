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
  },
});
