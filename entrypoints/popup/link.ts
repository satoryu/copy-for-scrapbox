async function createLinkForTab(tab: globalThis.Browser.tabs.Tab): Promise<string> {
  const title = (tab.title || '').replaceAll(/[\[\]]/g, '').replaceAll(/`(.*)`/g, '$1')

  return `[${tab.url} ${title}]`
}

async function createLinksForTabs(tabs: globalThis.Browser.tabs.Tab[]): Promise<string> {
  return Promise.all(tabs.map(createLinkForTab))
    .then((links) => (links.map((link) => (` ${link}`)).join("\n")))
}

export { createLinksForTabs, createLinkForTab }