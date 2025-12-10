import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatTimestamp } from './formatTimestamp';

describe('formatTimestamp', () => {
  beforeEach(() => {
    // Mock browser.i18n.getMessage
    vi.spyOn(browser.i18n, 'getMessage').mockImplementation((key: string, substitutions?: string | string[]) => {
      if (key === 'timeJustNow') return 'Just now';
      if (key === 'timeMinutesAgo' && Array.isArray(substitutions)) {
        return `${substitutions[0]} minutes ago`;
      }
      if (key === 'timeHoursAgo' && Array.isArray(substitutions)) {
        return `${substitutions[0]} hours ago`;
      }
      if (key === 'timeDaysAgo' && Array.isArray(substitutions)) {
        return `${substitutions[0]} days ago`;
      }
      return '';
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('returns "Just now" for timestamps less than 60 seconds ago', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // 0 seconds ago
    expect(formatTimestamp(now)).toBe('Just now');

    // 30 seconds ago
    expect(formatTimestamp(now - 30 * 1000)).toBe('Just now');

    // 59 seconds ago
    expect(formatTimestamp(now - 59 * 1000)).toBe('Just now');
  });

  test('returns minutes ago for timestamps between 1 and 59 minutes ago', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // 1 minute ago
    expect(formatTimestamp(now - 60 * 1000)).toBe('1 minutes ago');

    // 5 minutes ago
    expect(formatTimestamp(now - 5 * 60 * 1000)).toBe('5 minutes ago');

    // 30 minutes ago
    expect(formatTimestamp(now - 30 * 60 * 1000)).toBe('30 minutes ago');

    // 59 minutes ago
    expect(formatTimestamp(now - 59 * 60 * 1000)).toBe('59 minutes ago');
  });

  test('returns hours ago for timestamps between 1 and 23 hours ago', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // 1 hour ago
    expect(formatTimestamp(now - 60 * 60 * 1000)).toBe('1 hours ago');

    // 5 hours ago
    expect(formatTimestamp(now - 5 * 60 * 60 * 1000)).toBe('5 hours ago');

    // 12 hours ago
    expect(formatTimestamp(now - 12 * 60 * 60 * 1000)).toBe('12 hours ago');

    // 23 hours ago
    expect(formatTimestamp(now - 23 * 60 * 60 * 1000)).toBe('23 hours ago');
  });

  test('returns days ago for timestamps 24 hours or more ago', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // 1 day ago (24 hours)
    expect(formatTimestamp(now - 24 * 60 * 60 * 1000)).toBe('1 days ago');

    // 3 days ago
    expect(formatTimestamp(now - 3 * 24 * 60 * 60 * 1000)).toBe('3 days ago');

    // 7 days ago
    expect(formatTimestamp(now - 7 * 24 * 60 * 60 * 1000)).toBe('7 days ago');

    // 30 days ago
    expect(formatTimestamp(now - 30 * 24 * 60 * 60 * 1000)).toBe('30 days ago');
  });

  test('uses fallback messages when i18n returns empty string', () => {
    // Mock i18n to return empty strings (simulating missing translations)
    vi.spyOn(browser.i18n, 'getMessage').mockReturnValue('');

    const now = Date.now();
    vi.setSystemTime(now);

    // Should use fallback values
    expect(formatTimestamp(now)).toBe('Just now');
    expect(formatTimestamp(now - 5 * 60 * 1000)).toBe('5 minutes ago');
    expect(formatTimestamp(now - 2 * 60 * 60 * 1000)).toBe('2 hours ago');
    expect(formatTimestamp(now - 3 * 24 * 60 * 60 * 1000)).toBe('3 days ago');
  });

  test('handles edge cases at time boundaries', () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Exactly 60 seconds (should be 1 minute, not "just now")
    expect(formatTimestamp(now - 60 * 1000)).toBe('1 minutes ago');

    // Exactly 1 hour (3600 seconds)
    expect(formatTimestamp(now - 3600 * 1000)).toBe('1 hours ago');

    // Exactly 1 day (86400 seconds)
    expect(formatTimestamp(now - 86400 * 1000)).toBe('1 days ago');
  });
});
