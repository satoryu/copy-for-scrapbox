export function getMessage(key: string, fallback: string): string;
export function getMessage(key: string, substitutions: string[], fallback: string): string;
export function getMessage(
  key: string,
  substitutionsOrFallback: string | string[],
  fallback?: string
): string {
  if (Array.isArray(substitutionsOrFallback)) {
    return browser.i18n.getMessage(key, substitutionsOrFallback) || fallback || '';
  }
  return browser.i18n.getMessage(key) || substitutionsOrFallback;
}
