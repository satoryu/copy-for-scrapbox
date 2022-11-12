import { writeTextToClipboard } from './src/clipboard.js'

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: 'copy-for-scrapbox',
    title: 'Copy [URL PageTitle]'
  })
})

chrome.contextMenus.onClicked.addListener(function (_, tab) {
  const text = `[${tab.title} ${tab.url}]`

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: writeTextToClipboard,
    args: [text]
  })
})
