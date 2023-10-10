import { getClientId } from './id.js'
import { sendTrackEvent } from './google-analytics.js'
import contextMenuRepository from './context_menu'

chrome.runtime.onInstalled.addListener(function () {
  getClientId()
  sendTrackEvent({ name: 'installed' })

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
