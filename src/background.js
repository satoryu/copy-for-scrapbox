import { getClientId } from './id.js'
import { installationHandler } from './installation-handler.js'
import contextMenuRepository from './context_menu'

chrome.runtime.onInstalled.addListener(function ({ previousVersion, reason }) {
  getClientId()
    .then((_clientId) => installationHandler({ previousVersion, reason }))

  chrome.runtime.setUninstallURL('https://www.satoryu.com/copy-for-scrapbox/thank-you')

  contextMenuRepository.getContextMenuInfo().forEach((contextMenuInfo) => {
    chrome.contextMenus.create(contextMenuInfo)
  })
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  const handler = contextMenuRepository.getHandler(info.menuItemId)

  if (handler) {
    handler(info, tab)
  }
})
