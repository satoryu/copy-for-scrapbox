import { v4 as uuid } from "uuid";

async function generateClientId() {
  const newClientId = uuid()

  return chrome.storage.local
      .set({ clientId: newClientId })
      .then(() => newClientId)
}

async function getClientId() {
  const result = await chrome.storage.local.get("clientId");
  const clientId = result.clientId;

  if (clientId) {
    return clientId;
  }

  return generateClientId()
}

export { getClientId, generateClientId };
