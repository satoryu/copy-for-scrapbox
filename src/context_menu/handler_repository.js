export default class {
  handlers = {}

  registerHandler(handlerInfo) {
    if (this.handlers[handlerInfo.id]) {
      throw new Error('Handler already registered')
    }

    this.handlers[handlerInfo.id] = handlerInfo
  }

  async getHandler(menuId) {
    const handler = this.handlers[menuId]?.handler

    return handler
  }

  getContextMenuInfo() {
    return Object.values(this.handlers).map(({ id, contexts }) => ({ id, contexts }))
  }
}
