import { useState } from 'react';

const COPY_FEEDBACK_DURATION_MS = 2000;

export function useCopyToClipboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, COPY_FEEDBACK_DURATION_MS);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return { copiedId, copyToClipboard };
}
