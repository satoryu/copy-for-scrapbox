import { addToHistory } from './history';

async function writeTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
  await addToHistory(text);
}

export { writeTextToClipboard }
