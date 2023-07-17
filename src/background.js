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
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
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
})
