function createLinksForTabs(tabs) {
  return tabs.map(tab => {
    let title = tab.title.replaceAll(/[\[\]]/g, '').replaceAll(/`(.*)`/g, '$1')

    return ` [${tab.url} ${title}]`
  }).join("\n")
}

export { createLinksForTabs }