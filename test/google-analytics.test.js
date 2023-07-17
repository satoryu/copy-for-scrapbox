import { sendTrackEvent } from "../src/google-analytics.js";
import fetchMock from "jest-fetch-mock";
import { getClientId } from "../src/id.js";

jest.mock("./../src/id.js");

fetchMock.enableMocks();

describe("sendTrackEvent", () => {
  test("send an event", async () => {
    getClientId.mockReturnValue(Promise.resolve("client-id"));
    const result = await sendTrackEvent({ name: 'test' });

    expect(result).toBeDefined();
    expect(fetch.mock.calls.length).toEqual(1);

    const endpointUrl = new URL(fetch.mock.calls[0][0])
    expect(endpointUrl.host).toEqual('www.google-analytics.com')
    expect(endpointUrl.pathname).toEqual('/mp/collect')

    const params = endpointUrl.searchParams
    expect(params.get('measurement_id')).toEqual('measurement-id')
    expect(params.get('api_secret')).toEqual('api-secret')

    const request = fetch.mock.calls[0][1]
    const body = JSON.parse(request.body)
    expect(body.events[0].name).toEqual('test')
  });
});
