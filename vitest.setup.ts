import '@testing-library/jest-dom/vitest';

// Setup file for Vitest
// This file is executed before each test suite

// Global test setup can be added here
// For example: custom matchers, global mocks, etc.

// Fix for esbuild in jsdom environment
// esbuild expects TextEncoder/Uint8Array to work correctly
if (typeof window !== 'undefined') {
  //  Ensure TextEncoder/Decoder are available and work correctly in jsdom
  if (!global.TextEncoder) {
    const util = require('util');
    global.TextEncoder = util.TextEncoder;
    global.TextDecoder = util.TextDecoder;
  }

  // Mock navigator.clipboard for component tests
  if (typeof window.navigator !== 'undefined') {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: () => Promise.resolve(),
      },
      writable: true,
      configurable: true,
    });
  }
}
