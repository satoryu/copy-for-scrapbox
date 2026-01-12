import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Setup file for component tests (using separate config without WXT)

// Mock browser API (since we're not using WxtVitest plugin)
global.browser = {
  i18n: {
    getMessage: vi.fn((key: string) => key),
  },
  tabs: {
    query: vi.fn(),
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: {
      addListener: vi.fn(),
    },
  },
  scripting: {
    executeScript: vi.fn(),
  },
} as any;

// Mock navigator.clipboard for component tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window.navigator, 'clipboard', {
    value: {
      writeText: vi.fn(() => Promise.resolve()),
    },
    writable: true,
    configurable: true,
  });
}
