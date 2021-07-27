function createLinksForTabs(tabs) {
  return tabs.map(tab => ` [${tab.url} ${tab.title}]`).join("\n")
}

export { createLinksForTabs }