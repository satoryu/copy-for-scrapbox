import ContextMenuRepository from './handler_repository.js'
import { createLinkForTab } from '../link.js';
import { writeTextToClipboard } from '../clipboard.js';
import { sendTrackEvent } from '../google-analytics.js';

const repository = new ContextMenuRepository()

repository.registerHandler({
  id: 'copy-for-scrapbox',
  title: 'Copy [URL PageTitle]',
  handler: async (info, tab) => {
    createLinkForTab(tab).then((text) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: writeTextToClipboard,
        args: [text]
      })
    }).then(() => {
      sendTrackEvent({
        name: 'context_menu',
        params: {
          id: info.menuItemId
        }
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
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: writeTextToClipboard,
        args: [text]
      })
    }).then(() => {
      sendTrackEvent({
        name: 'context_menu',
        params: {
          id: info.menuItemId
        }
      })
    })
  }
})


export default repository;
