function createLinkForTab(tab) {
  const title = tab.title.replaceAll(/[\[\]]/g, '').replaceAll(/`(.*)`/g, '$1')

  return `[${tab.url} ${title}]`
}

function createLinksForTabs(tabs) {
  return tabs.map(createLinkForTab).join("\n")
}

export { createLinksForTabs, createLinkForTab }