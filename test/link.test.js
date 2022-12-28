import { createLinkForTab } from "../src/link.js";

describe("createLinkForTab", () => {
  test("creates a link from a given tab's title and url", () => {
    const link = createLinkForTab({
      title: "title",
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com title]");
  });

  test("omits square brackets in title", () => {
    const link = createLinkForTab({
      title: "[title]",
      url: "https://example.com",
    });

    expect(link).toEqual("[https://example.com title]");
  });
});