import ContextMenuRepository from './handler_repository'
import { createLinkForTab } from '../popup/link';
import { writeTextToClipboard } from '../popup/clipboard';

const repository = new ContextMenuRepository()

repository.registerHandler({
  id: 'copy-for-scrapbox',
  title: 'Copy [URL PageTitle]',
  handler: async (_info, tab) => {
    createLinkForTab(tab).then((text) => {
      const tabId = tab.id
      if (tabId === undefined) {
        console.error('Tab ID is undefined')
        return
      }
      browser.scripting.executeScript({
        target: { tabId },
        func: writeTextToClipboard,
        args: [text]
      })
    })
  }
})

repository.registerHandler({
  id: 'copy-selection-as-quotation',
  title: 'Copy as Quotation',
  contexts: ['selection'],
  handler: async (info, tab) => {
    createLinkForTab(tab)
    .then((text) => (`> ${info.selectionText}\n> ${text}`))
    .then((text) => {
      const tabId = tab.id
      if (tabId === undefined) {
        console.error('Tab ID is undefined')
        return
      }
      browser.scripting.executeScript({
        target: { tabId },
        func: writeTextToClipboard,
        args: [text]
      })
    })
  }
})

export default repository;
