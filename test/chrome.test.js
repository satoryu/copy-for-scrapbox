import { findTabs, getCurrentTab, getSelectedTabs, getAllTabsOnCurrentWindow } from '../src/chrome.js'

global.chrome = {
  tabs: {
    query: jest.fn(options => (options))
  }
}

beforeEach(() => {
  chrome.tabs.query.mockClear()
})

describe("findTabs", () => {
  it("passes given options to chrome.tabs.query()", async () => {
    const expectedOptions = { active: true, currentWindow: true }

    await findTabs(expectedOptions)

    expect(chrome.tabs.query.mock.calls[0][0]).toEqual(expectedOptions)
  })
})

describe("getCurrentTab", () => {
  it("passes a specific option to findTabs to get the current tab", async () => {
    const expectedOptions = { active: true, currentWindow: true }

    await getCurrentTab()

    expect(chrome.tabs.query.mock.calls[0][0]).toEqual(expectedOptions)
  })
})

describe("getSelectedTabs", () => {
  it("passes a specific option to findTabs to get the selected tabs", async () => {
    const expectedOptions = { highlighted: true, currentWindow: true }

    await getSelectedTabs()

    expect(chrome.tabs.query.mock.calls[0][0]).toEqual(expectedOptions)
  })
})

describe("getAllTabsOnCurrentWindow", () => {
  it("passes a specific option to findTabs to get the selected tabs", async () => {
    const expectedOptions = { currentWindow: true }

    await getAllTabsOnCurrentWindow()

    expect(chrome.tabs.query.mock.calls[0][0]).toEqual(expectedOptions)
  })
})