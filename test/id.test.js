import { getClientId } from "../src/id.js";

global.chrome = {
  storage: {
    local: {
      get: jest.fn((_key) => { clientId: 'dummy id'}),
      set: jest.fn((_object) => Promise.resolve() )
    }
  }
}

beforeEach(() => {
  chrome.storage.local.get.mockClear()
})

describe('getClientId', () => {
  describe('When local storage have clientId', () => {
    test('returns the clientId', async () => {
      chrome.storage.local.get.mockReturnValue(Promise.resolve({ clientId: 'dummy-client-id'}))
      const clientId = await getClientId()

      expect(clientId).toEqual('dummy-client-id')
      expect(chrome.storage.local.get).toHaveBeenCalledWith('clientId')
    })
  })
  describe('When local storage does not have clientId', () => {
    test('generates new clientId and return it', async () => {
      chrome.storage.local.get.mockReturnValue(Promise.resolve({}))
      const clientId = await getClientId()

      expect(clientId).toEqual('new-client-id')
      expect(chrome.storage.local.set).toHaveBeenCalled()
    })
  })
})
