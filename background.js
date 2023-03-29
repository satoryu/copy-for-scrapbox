import { writeTextToClipboard } from './src/clipboard.js'
import { createLinkForTab } from './src/link.js'

chrome.runtime.onInstalled.addListener(function () {
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
