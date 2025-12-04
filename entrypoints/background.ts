import contextMenuRepository from './context_menu'

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(function () {
    contextMenuRepository.getContextMenuInfo().forEach((contextMenuInfo) => {
      // Resolve i18n messages if title starts with __MSG_
      let title = contextMenuInfo.title;
      if (title.startsWith('__MSG_') && title.endsWith('__')) {
        const messageKey = title.slice(6, -2);
        title = (browser.i18n.getMessage as any)(messageKey) || title;
      }

      browser.contextMenus.create({
        ...contextMenuInfo,
        title
      })
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
