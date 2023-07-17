import { sendTrackEvent } from '../src/google-analytics.js'
import 'jest-fetch-mock'

fetchMock.enableMocks()

describe('sendTrackEvent', () => {
  test('send an event', async () => {
    const result = await sendTrackEvent()

    expect(result).toBeDefined()
  })
})