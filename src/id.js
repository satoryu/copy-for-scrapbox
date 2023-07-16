import { v4 as uuid } from "uuid";

async function generateClientId() {
  return uuid();
}

async function getClientId() {
  const result = await chrome.storage.local.get("clientId");
  const clientId = result.clientId;

  if (clientId) {
    return clientId;
  }

  return generateClientId().then((newClientId) => (
    chrome.storage.local
      .set({ clientId: newClientId })
      .then(() => newClientId)
   ));
}

export { getClientId, generateClientId };
