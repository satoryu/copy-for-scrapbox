function findTabs(queryOption) {
  return chrome.tabs.query(queryOption)
}

function getCurrentTab() {
  return findTabs({active: true, currentWindow: true})
}

function getSelectedTabs() {
  return findTabs({highlighted: true, currentWindow: true})
}

function getAllTabsOnCurrentWindow() {
  return findTabs({ currentWindow: true })
}

export { findTabs, getCurrentTab, getSelectedTabs, getAllTabsOnCurrentWindow }