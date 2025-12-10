import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { getMessage } from './i18n';

describe('getMessage', () => {
  beforeEach(() => {
    vi.spyOn(browser.i18n, 'getMessage').mockImplementation((key: string, substitutions?: string | string[]) => {
      // Simulate i18n behavior - return empty string for unknown keys
      if (key === 'knownKey') return 'Translated message';
      if (key === 'keyWithSubstitution' && Array.isArray(substitutions)) {
        return `Value is ${substitutions[0]}`;
      }
      if (key === 'keyWithMultipleSubstitutions' && Array.isArray(substitutions)) {
        return `First: ${substitutions[0]}, Second: ${substitutions[1]}`;
      }
      return '';
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('without substitutions (2 arguments)', () => {
    test('returns translated message when key exists', () => {
      const result = getMessage('knownKey', 'Fallback');
      expect(result).toBe('Translated message');
    });

    test('returns fallback when key does not exist', () => {
      const result = getMessage('unknownKey', 'Fallback message');
      expect(result).toBe('Fallback message');
    });

    test('returns fallback when i18n returns empty string', () => {
      const result = getMessage('emptyKey', 'Default value');
      expect(result).toBe('Default value');
    });
  });

  describe('with substitutions (3 arguments)', () => {
    test('returns translated message with substitution', () => {
      const result = getMessage('keyWithSubstitution', ['42'], 'Fallback');
      expect(result).toBe('Value is 42');
    });

    test('returns translated message with multiple substitutions', () => {
      const result = getMessage('keyWithMultipleSubstitutions', ['one', 'two'], 'Fallback');
      expect(result).toBe('First: one, Second: two');
    });

    test('returns fallback when key does not exist', () => {
      const result = getMessage('unknownKey', ['value'], 'Fallback with $1');
      expect(result).toBe('Fallback with $1');
    });

    test('returns fallback when i18n returns empty string', () => {
      const result = getMessage('emptyKey', ['value'], 'Default: value');
      expect(result).toBe('Default: value');
    });

    test('returns empty string when fallback is not provided and key does not exist', () => {
      const result = getMessage('unknownKey', ['value'], undefined as unknown as string);
      expect(result).toBe('');
    });
  });

  describe('edge cases', () => {
    test('handles empty substitutions array', () => {
      const result = getMessage('unknownKey', [], 'Fallback');
      expect(result).toBe('Fallback');
    });

    test('handles empty fallback string', () => {
      const result = getMessage('unknownKey', '');
      expect(result).toBe('');
    });

    test('calls browser.i18n.getMessage with correct arguments for simple call', () => {
      getMessage('testKey', 'Fallback');
      expect(browser.i18n.getMessage).toHaveBeenCalledWith('testKey');
    });

    test('calls browser.i18n.getMessage with correct arguments for substitution call', () => {
      getMessage('testKey', ['sub1', 'sub2'], 'Fallback');
      expect(browser.i18n.getMessage).toHaveBeenCalledWith('testKey', ['sub1', 'sub2']);
    });
  });
});
