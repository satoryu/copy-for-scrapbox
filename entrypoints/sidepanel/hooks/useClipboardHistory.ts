import { useState, useEffect } from 'react';
import { getHistory, type ClipboardHistoryItem } from '../../../utils/history';

export function useClipboardHistory() {
  const [history, setHistory] = useState<ClipboardHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();

    const handleStorageChange = (changes: { [key: string]: browser.storage.StorageChange }) => {
      if (changes.clipboardHistory) {
        setHistory(changes.clipboardHistory.newValue || []);
      }
    };

    browser.storage.local.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistory(items);
  };

  return history;
}
