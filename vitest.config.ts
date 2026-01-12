import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    globals: true,
    watch: false,
    // Default to node environment for utility tests with WxtVitest
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // Use jsdom for React component tests
    // @ts-expect-error - environmentMatchGlobs is supported but types may not be up to date
    environmentMatchGlobs: [
      ['**/components/**/*.test.{ts,tsx,js,jsx}', 'jsdom'],
      ['**/popup/**/*.test.{ts,tsx,js,jsx}', 'jsdom'],
      ['**/sidepanel/**/*.test.{ts,tsx,js,jsx}', 'jsdom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        '.output/**',
        '.wxt/**',
        '**/*.config.ts',
        '**/*.config.js',
        '**/dist/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  }
});
