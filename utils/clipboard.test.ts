import { describe, test, expect, vi, beforeEach } from "vitest";
import { writeTextToClipboard } from "./clipboard";
import * as history from "./history";

// Mock the history module
vi.mock("./history", () => ({
  addToHistory: vi.fn(),
}));

describe("writeTextToClipboard", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock navigator object if it doesn't exist (for Node.js environment)
    if (!globalThis.navigator) {
      Object.defineProperty(globalThis, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });
    }

    // Mock navigator.clipboard.writeText
    Object.defineProperty(globalThis.navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  test("writes text to clipboard", async () => {
    const text = "Test clipboard content";

    await writeTextToClipboard(text);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  test("adds text to history after clipboard write", async () => {
    const text = "Test clipboard content";

    await writeTextToClipboard(text);

    expect(history.addToHistory).toHaveBeenCalledWith(text);
    expect(history.addToHistory).toHaveBeenCalledTimes(1);
  });

  test("calls clipboard and history in correct order", async () => {
    const text = "Test clipboard content";
    const callOrder: string[] = [];

    vi.mocked(navigator.clipboard.writeText).mockImplementation(async () => {
      callOrder.push("clipboard");
    });

    vi.mocked(history.addToHistory).mockImplementation(async () => {
      callOrder.push("history");
    });

    await writeTextToClipboard(text);

    expect(callOrder).toEqual(["clipboard", "history"]);
  });

  test("handles empty string", async () => {
    const text = "";

    await writeTextToClipboard(text);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("");
    expect(history.addToHistory).toHaveBeenCalledWith("");
  });

  test("handles unicode content", async () => {
    const text = "日本語のテキスト 🎉";

    await writeTextToClipboard(text);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    expect(history.addToHistory).toHaveBeenCalledWith(text);
  });

  test("handles multi-line content", async () => {
    const text = "Line 1\nLine 2\nLine 3";

    await writeTextToClipboard(text);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    expect(history.addToHistory).toHaveBeenCalledWith(text);
  });

  test("propagates clipboard write errors", async () => {
    const text = "Test content";
    const error = new Error("Clipboard write failed");

    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(error);

    await expect(writeTextToClipboard(text)).rejects.toThrow("Clipboard write failed");

    // History should not be called if clipboard write fails
    expect(history.addToHistory).not.toHaveBeenCalled();
  });
});
