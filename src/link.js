function createLinksForTabs(tabs) {
  return tabs.map(tab => {
    let title = tab.title.replaceAll(/[\[\]]/g, '')

    return ` [${tab.url} ${title}]`
  }).join("\n")
}

export { createLinksForTabs }