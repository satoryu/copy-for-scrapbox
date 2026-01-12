export function getMessage(key: string, fallback: string): string;
export function getMessage(key: string, substitutions: string[], fallback: string): string;
export function getMessage(
  key: string,
  substitutionsOrFallback: string | string[],
  fallback?: string
): string {
  if (Array.isArray(substitutionsOrFallback)) {
    // @ts-expect-error - Dynamic key access is needed for i18n fallback pattern
    return browser.i18n.getMessage(key, substitutionsOrFallback) || fallback || '';
  }
  // @ts-expect-error - Dynamic key access is needed for i18n fallback pattern
  return browser.i18n.getMessage(key) || substitutionsOrFallback;
}
