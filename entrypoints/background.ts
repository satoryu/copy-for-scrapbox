import contextMenuRepository from './context_menu'

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(function () {
    contextMenuRepository.getContextMenuInfo().forEach((contextMenuInfo) => {
      browser.contextMenus.create(contextMenuInfo)
    })
  })

  browser.contextMenus.onClicked.addListener(function (info, tab) {
    const menuItemId: string = info.menuItemId.toString()
    const handler = contextMenuRepository.getHandler(menuItemId)

    if (handler && tab) {
      handler(info, tab)
    }
  })

});
