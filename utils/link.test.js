import { describe, test, expect } from "vitest";
import { createLinkForTab, createLinksForTabs } from "@/utils/link.js";

describe("createLinkForTab", () => {
  test("creates a link from a given tab's title and url", async () => {
    const link = await createLinkForTab({
      title: "title",
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com title]");
  });

  test("omits square brackets in title", async () => {
    const link = await createLinkForTab({
      title: "[title]",
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com title]");
  });

  test("removes backticks from title", async () => {
    const link = await createLinkForTab({
      title: "`code block`",
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com code block]");
  });

  test("handles empty title", async () => {
    const link = await createLinkForTab({
      title: "",
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com ]");
  });

  test("handles undefined title", async () => {
    const link = await createLinkForTab({
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com ]");
  });

  test("handles null title", async () => {
    const link = await createLinkForTab({
      title: null,
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com ]");
  });

  test("removes multiple brackets and backticks", async () => {
    const link = await createLinkForTab({
      title: "[Example] with `code` and [more brackets]",
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com Example with code and more brackets]");
  });

  test("handles mixed special characters", async () => {
    const link = await createLinkForTab({
      title: "Test [Title] with `inline code` & symbols!",
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com Test Title with inline code & symbols!]");
  });

  test("handles nested backticks (partial removal)", async () => {
    // Note: Current regex implementation doesn't fully handle nested backticks
    // It removes the outer backticks but leaves inner ones
    const link = await createLinkForTab({
      title: "`nested `code` blocks`",
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com nested `code` blocks]");
  });

  test("preserves unicode characters", async () => {
    const link = await createLinkForTab({
      title: "日本語タイトル",
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com 日本語タイトル]");
  });
});

describe("createLinksForTabs", () => {
  test("creates links from empty array", async () => {
    const links = await createLinksForTabs([]);

    expect(links).toEqual("");
  });

  test("creates link from single tab", async () => {
    const links = await createLinksForTabs([
      { title: "First Tab", url: "https://example1.com" }
    ]);

    expect(links).toEqual(" [https://example1.com First Tab]");
  });

  test("creates links from multiple tabs", async () => {
    const links = await createLinksForTabs([
      { title: "First Tab", url: "https://example1.com" },
      { title: "Second Tab", url: "https://example2.com" },
      { title: "Third Tab", url: "https://example3.com" }
    ]);

    expect(links).toEqual(
      " [https://example1.com First Tab]\n" +
      " [https://example2.com Second Tab]\n" +
      " [https://example3.com Third Tab]"
    );
  });

  test("creates links with sanitized titles", async () => {
    const links = await createLinksForTabs([
      { title: "[First] Tab", url: "https://example1.com" },
      { title: "`Second` Tab", url: "https://example2.com" }
    ]);

    expect(links).toEqual(
      " [https://example1.com First Tab]\n" +
      " [https://example2.com Second Tab]"
    );
  });

  test("handles tabs with missing titles", async () => {
    const links = await createLinksForTabs([
      { title: "First Tab", url: "https://example1.com" },
      { url: "https://example2.com" },
      { title: "", url: "https://example3.com" }
    ]);

    expect(links).toEqual(
      " [https://example1.com First Tab]\n" +
      " [https://example2.com ]\n" +
      " [https://example3.com ]"
    );
  });
});