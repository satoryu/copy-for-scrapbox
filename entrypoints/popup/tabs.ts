type QueryOption = {
  active?: boolean
  currentWindow?: boolean
  highlighted?: boolean
}

function findTabs(queryOption: QueryOption): Promise<globalThis.Browser.tabs.Tab[]> {
  return browser.tabs.query(queryOption)
}

function getCurrentTab(): Promise<globalThis.Browser.tabs.Tab[]> {
  return findTabs({active: true, currentWindow: true})
}

function getSelectedTabs(): Promise<globalThis.Browser.tabs.Tab[]> {
  return findTabs({highlighted: true, currentWindow: true})
}

function getAllTabsOnCurrentWindow(): Promise<globalThis.Browser.tabs.Tab[]> {
  return findTabs({ currentWindow: true })
}

export { findTabs, getCurrentTab, getSelectedTabs, getAllTabsOnCurrentWindow }