import { getClientId } from "./id";

const GA_ENDPOINT = process.env.VITE_GA_ENDPOINT;
const MEASUREMENT_ID = process.env.VITE_MEASUREMENT_ID;
const API_SECRET = process.env.VITE_API_SECRET;

async function sendTrackEvent(event) {
  return fetch(
    `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: await getClientId(),
        events: [event]
      })
    }
  );
}

export { sendTrackEvent };
