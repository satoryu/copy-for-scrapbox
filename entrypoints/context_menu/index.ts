import ContextMenuRepository from './handler_repository'
import { createLinkForTab } from '@/utils/link';
import { writeTextToClipboard } from '@/utils/clipboard';

const repository = new ContextMenuRepository()

repository.registerHandler({
  id: 'copy-for-scrapbox',
  title: '__MSG_contextMenuTitle__',
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
  title: '__MSG_contextMenuQuotationTitle__',
  // @ts-expect-error - 'selection' is a valid context type for Chrome extensions
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

repository.registerHandler({
  id: 'open-clipboard-history',
  title: '__MSG_contextMenuOpenHistory__',
  handler: async (_info, tab) => {
    const windowId = tab.windowId;
    if (windowId === undefined) {
      console.error('Window ID is undefined');
      return;
    }
    await browser.sidePanel.open({ windowId });
  }
})

export default repository;
