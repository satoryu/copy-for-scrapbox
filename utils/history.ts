export interface ClipboardHistoryItem {
  id: string;
  text: string;
  timestamp: number;
}

const STORAGE_KEY = 'clipboardHistory';
const MAX_HISTORY_ITEMS = 100;

async function getHistory(): Promise<ClipboardHistoryItem[]> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

async function addToHistory(text: string): Promise<void> {
  const history = await getHistory();

  const newItem: ClipboardHistoryItem = {
    id: crypto.randomUUID(),
    text,
    timestamp: Date.now(),
  };

  // Add new item at the beginning (newest first)
  history.unshift(newItem);

  // Keep only the latest MAX_HISTORY_ITEMS
  if (history.length > MAX_HISTORY_ITEMS) {
    history.splice(MAX_HISTORY_ITEMS);
  }

  await browser.storage.local.set({ [STORAGE_KEY]: history });
}

export { getHistory, addToHistory };
