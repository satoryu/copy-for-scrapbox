import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { getHistory, addToHistory } from "./history";

// Mock storage for testing
const mockStorage: Record<string, any> = {};

describe("history", () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

    // Mock browser.storage.local methods
    vi.spyOn(browser.storage.local, 'get').mockImplementation((key: string) => {
      return Promise.resolve({ [key]: mockStorage[key] });
    });

    vi.spyOn(browser.storage.local, 'set').mockImplementation((data: Record<string, any>) => {
      Object.assign(mockStorage, data);
      return Promise.resolve();
    });

    // Mock crypto.randomUUID
    let counter = 0;
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      return `test-uuid-${counter++}`;
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
      mockStorage.clipboardHistory = mockHistory;

      const history = await getHistory();
      expect(history).toEqual(mockHistory);
    });
  });

  describe("addToHistory", () => {
    test("adds a new item to empty history", async () => {
      await addToHistory("test text");

      expect(browser.storage.local.set).toHaveBeenCalled();
      const history = await getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].text).toBe("test text");
      expect(history[0].id).toBeDefined();
      expect(history[0].timestamp).toBeDefined();
    });

    test("adds new item to the beginning of existing history", async () => {
      mockStorage.clipboardHistory = [
        { id: "1", text: "old text", timestamp: 1000 },
      ];

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
      mockStorage.clipboardHistory = existingItems;

      await addToHistory("new text");

      const history = await getHistory();
      expect(history).toHaveLength(100);
      expect(history[0].text).toBe("new text");
      expect(history[99].text).toBe("text-98"); // Oldest item (text-99) should be removed
    });
  });
});
