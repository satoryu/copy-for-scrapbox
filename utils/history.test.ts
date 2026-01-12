import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import { getHistory, addToHistory } from "./history";

describe("history", () => {
  beforeEach(() => {
    // Reset fake browser state (clears in-memory storage)
    fakeBrowser.reset();

    // Mock crypto.randomUUID
    let counter = 0;
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      return `test-uuid-${counter++}` as `${string}-${string}-${string}-${string}-${string}`;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getHistory", () => {
    test("returns empty array when no history exists", async () => {
      const history = await getHistory();
      expect(history).toEqual([]);
    });

    test("returns stored history items", async () => {
      const mockHistory = [
        { id: "1", text: "test1", timestamp: 1000 },
        { id: "2", text: "test2", timestamp: 2000 },
      ];
      await browser.storage.local.set({ clipboardHistory: mockHistory });

      const history = await getHistory();
      expect(history).toEqual(mockHistory);
    });
  });

  describe("addToHistory", () => {
    test("adds a new item to empty history", async () => {
      await addToHistory("test text");

      const history = await getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].text).toBe("test text");
      expect(history[0].id).toBeDefined();
      expect(history[0].timestamp).toBeDefined();
    });

    test("adds new item to the beginning of existing history", async () => {
      await browser.storage.local.set({
        clipboardHistory: [
          { id: "1", text: "old text", timestamp: 1000 },
        ],
      });

      await addToHistory("new text");

      const history = await getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].text).toBe("new text");
      expect(history[1].text).toBe("old text");
    });

    test("keeps only the latest 100 items", async () => {
      // Create 100 existing items
      const existingItems = Array.from({ length: 100 }, (_, i) => ({
        id: `id-${i}`,
        text: `text-${i}`,
        timestamp: i,
      }));
      await browser.storage.local.set({ clipboardHistory: existingItems });

      await addToHistory("new text");

      const history = await getHistory();
      expect(history).toHaveLength(100);
      expect(history[0].text).toBe("new text");
      expect(history[99].text).toBe("text-98"); // Oldest item (text-99) should be removed
    });
  });
});
