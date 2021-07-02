function findTabs(queryOption) {
  return chrome.tabs.query(queryOption)
}

export { findTabs }