import { getClientId } from "../src/id.js";
import { v4 as uuid } from 'uuid'

jest.mock('uuid', () => ({ v4: jest.fn() }))

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
      uuid.mockReturnValue(Promise.resolve('generated-uuid'))

      const clientId = await getClientId()

      expect(clientId).toEqual('generated-uuid')
      expect(chrome.storage.local.set).toHaveBeenCalled()
    })
  })
})
