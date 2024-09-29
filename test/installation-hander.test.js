import { installationHandler } from "../src/installation-handler.js"
import { sendTrackEvent } from "../src/google-analytics.js"

global.chrome = {
  runtime: {
    getManifest: () => ({ version: '4.4.4' })
  },
  storage: {
    local: {
      set: jest.fn(() => Promise.resolve()),
      get: jest.fn(() => Promise.resolve({})),
    },
  }
}

jest.mock('../src/google-analytics.js', () => ({ sendTrackEvent: jest.fn() }))

describe('installationHandler', () => {
  beforeEach(() => {
    chrome.storage.local.set.mockClear()
    sendTrackEvent.mockClear()

    sendTrackEvent.mockReturnValue(Promise.resolve())
  })

  describe('When the reason is install', () => {
    it('should send installed event to google analytics', async () => {
      await installationHandler({ reason: 'install' })

      expect(sendTrackEvent).toHaveBeenCalledWith({ name: 'custom_installed', params: { version: '4.4.4' } })
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ lastInstalledVersion: '4.4.4' })
    })
  })

  describe('When the reason is update', () => {
    it('should send updated event to google analytics', async () => {
      chrome.storage.local.get.mockReturnValue(Promise.resolve({ lastInstalledVersion: '3.3.3' }))
      await installationHandler({ reason: 'update', previousVersion: '4.4.3' })

      expect(sendTrackEvent).toHaveBeenCalledWith({ name: 'custom_updated', params: { version: '4.4.4', previousVersion: '4.4.3' } })
      expect(chrome.storage.local.set).not.toHaveBeenCalled()
    })

    it('should send installed event if latestInstalledVersion is not set', async () => {
      chrome.storage.local.get.mockReturnValue(Promise.resolve({ lastInstalledVersion: null }))
      await installationHandler({ reason: 'update', previousVersion: '4.4.3' })

      expect(sendTrackEvent).toHaveBeenCalledWith({ name: 'custom_installed', params: { version: '4.4.4' } })
    })
  })
})
