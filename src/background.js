import { getClientId, getUserId } from './id.js'
import { installationHandler } from './installation-handler.js'
import contextMenuRepository from './context_menu'

chrome.runtime.onInstalled.addListener(function ({ previousVersion, reason }) {
  installationHandler({ previousVersion, reason })

  Promise.all([getClientId(), getUserId()])
    .then(([clientId, userId]) => {
      const { version } = chrome.runtime.getManifest()
      chrome.runtime.setUninstallURL(`https://www.satoryu.com/copy-for-scrapbox/thank-you?version=${version}&clientId=${clientId}&userId=${userId}`)
    })

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
