import ContextMenuRepository from '../../src/context_menu/handler_repository.js'

describe('ContextMenuRepository', () => {
  describe('#registerHandler', () => {
    it('returns undefined', () => {
      const repository = new ContextMenuRepository()
      const handlerInfo = {
        id: 'some-handler',
        contexts: ['selection'],
        handler: async () => { return 'fake value'}
      }

      expect(repository.registerHandler(handlerInfo)).toBeUndefined()
    })

    describe('When conflicting handler is registered', () => {
      it('throws an error', () => {
        const repository = new ContextMenuRepository()
        const handlerInfo = {
          id: 'some-handler',
          contexts: ['selection'],
          handler: async () => { return 'fake value'}
        }

        expect(repository.registerHandler(handlerInfo)).toBeUndefined()
        expect(() => repository.registerHandler(handlerInfo)).toThrowError('Handler already registered')
      })
    })
  })

  describe('#getHandler', () => {
    it('returns a context menu handler for a given menuId', async () => {
      const repository = new ContextMenuRepository()
      repository.registerHandler({
        id: 'copy-for-scrapbox',
        title: 'Copy [URL PageTitle]',
        handler: async () => { return 'fake value'}
      })

      const handler = await repository.getHandler('copy-for-scrapbox')
      expect(handler()).resolves.toEqual('fake value')
    })

    describe('When no handler is registered', () => {
      it('returns undefined', async () => {
        const repository = new ContextMenuRepository()
        const handler = await repository.getHandler('copy-for-scrapbox')

        expect(handler).toBeUndefined()
      })
    })

    describe('When multiple handlers are registered', () => {
      it('returns the handler for the given menuId', async () => {
        const repository = new ContextMenuRepository()
        repository.registerHandler({
          id: 'copy-for-scrapbox',
          title: 'Copy [URL PageTitle]',
          handler: async () => { return 'fake value'}
        })
        repository.registerHandler({
          id: 'another-handeler',
          title: 'Another Handler',
          handler: async () => { return 'another fake value'}
        })

        const handler = await repository.getHandler('another-handeler')
        expect(handler()).resolves.toEqual('another fake value')
      })
    })
  })
})
