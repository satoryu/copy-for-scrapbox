import { writeTextToClipboard } from './clipboard.js'
import { createLinkForTab } from './link.js'
import { getClientId } from './id.js'
import { sendTrackEvent } from './google-analytics.js'

chrome.runtime.onInstalled.addListener(function () {
  getClientId()
  sendTrackEvent({ name: 'installed' })
  chrome.contextMenus.create({
    id: 'copy-for-scrapbox',
    title: 'Copy [URL PageTitle]'
  })
  chrome.contextMenus.create({
    id: 'copy-selection-as-quotation',
    contexts: ["selection"],
    title: "Copy as Quotation"
  })
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  let contextMenuWork;
  switch(info.menuItemId) {
    case "copy-for-scrapbox":
      contextMenuWork = createLinkForTab(tab)
      break;
    case "copy-selection-as-quotation":
      contextMenuWork = createLinkForTab(tab)
        .then((text) => (`> ${info.selectionText}\n> ${text}`))
      break;
    default:
      console.warn(`Caught undefined menuItemId: ${info.menuItemId}`)
      return;
  }

  contextMenuWork.then((text) => {
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
})
