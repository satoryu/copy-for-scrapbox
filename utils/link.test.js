import { describe, test, expect } from "vitest";
import { createLinkForTab } from "@/utils/link.js";

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
});