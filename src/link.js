async function createLinkForTab(tab) {
  const title = tab.title.replaceAll(/[\[\]]/g, '').replaceAll(/`(.*)`/g, '$1')

  return `[${tab.url} ${title}]`
}

async function createLinksForTabs(tabs) {
  return Promise.all(tabs.map(createLinkForTab))
    .then((links) => (links.map((link) => (` ${link}`)).join("\n")))
}

export { createLinksForTabs, createLinkForTab }