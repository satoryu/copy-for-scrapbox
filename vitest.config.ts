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
    // Only include utility tests (component tests use separate config)
    include: [
      'utils/**/*.test.{ts,tsx,js,jsx}',
      'entrypoints/sidepanel/utils/**/*.test.{ts,tsx,js,jsx}',
    ],
    // No need for extensive excludes since include is already specific
    exclude: [
      '**/node_modules/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'utils/**/*.{ts,tsx,js,jsx}',
        'entrypoints/sidepanel/utils/**/*.{ts,tsx,js,jsx}',
      ],
      exclude: [
        'node_modules/**',
        '.output/**',
        '.wxt/**',
        '**/*.config.ts',
        '**/*.config.js',
        '**/dist/**',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        'vitest.setup.ts',
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
