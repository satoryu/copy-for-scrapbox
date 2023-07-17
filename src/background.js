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

chrome.contextMenus.onClicked.addListener(function (_, tab) {
  createLinkForTab(tab).then((text) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: writeTextToClipboard,
      args: [text]
    })
  })
})
