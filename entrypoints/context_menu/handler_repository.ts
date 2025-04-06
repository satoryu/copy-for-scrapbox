type HandlerInfo = {
  id: string
  title: string
  contexts?: Array<globalThis.Browser.contextMenus.ContextType>
  handler: (info: globalThis.Browser.contextMenus.OnClickData, tab: globalThis.Browser.tabs.Tab) => Promise<void>
}

export default class HandlerRepository {
  private handlers: Record<string, HandlerInfo> = {}

  registerHandler(handlerInfo: HandlerInfo): void {
    if (this.handlers[handlerInfo.id]) {
      throw new Error('Handler already registered')
    }

    this.handlers[handlerInfo.id] = handlerInfo
  }

  getHandler(menuId: string): HandlerInfo['handler'] | undefined {
    const handler = this.handlers[menuId]?.handler

    return handler
  }

  getContextMenuInfo(): Array<Pick<HandlerInfo, 'id' | 'title'>> {
    return Object.values(this.handlers).map(({ id, title, contexts }) => ({ id, title, contexts }))
  }
}
