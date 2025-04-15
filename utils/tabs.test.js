import { describe, it, expect, beforeEach, vi } from 'vitest'
import { findTabs, getCurrentTab, getSelectedTabs, getAllTabsOnCurrentWindow } from '@/utils/tabs'

const mockQuery = vi.fn(options => options);

vi.spyOn(browser.tabs, 'query').mockImplementation(mockQuery);

beforeEach(() => {
  mockQuery.mockClear();
});

describe("findTabs", () => {
  it("passes given options to browser.tabs.query()", async () => {
    const expectedOptions = { active: true, currentWindow: true }

    await findTabs(expectedOptions)

    expect(mockQuery.mock.calls[0][0]).toEqual(expectedOptions)
  })
})

describe("getCurrentTab", () => {
  it("passes a specific option to findTabs to get the current tab", async () => {
    const expectedOptions = { active: true, currentWindow: true }

    await getCurrentTab()

    expect(mockQuery.mock.calls[0][0]).toEqual(expectedOptions)
  })
})

describe("getSelectedTabs", () => {
  it("passes a specific option to findTabs to get the selected tabs", async () => {
    const expectedOptions = { highlighted: true, currentWindow: true }

    await getSelectedTabs()

    expect(mockQuery.mock.calls[0][0]).toEqual(expectedOptions)
  })
})

describe("getAllTabsOnCurrentWindow", () => {
  it("passes a specific option to findTabs to get the selected tabs", async () => {
    const expectedOptions = { currentWindow: true }

    await getAllTabsOnCurrentWindow()

    expect(mockQuery.mock.calls[0][0]).toEqual(expectedOptions)
  })
})