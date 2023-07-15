async function getClientId() {
  const result = await chrome.storage.local.get("clientId");
  const clientId = result.clientId;

  if (clientId) {
    return clientId;
  }

  const newClientId = "new-client-id";
  return chrome.storage.local
    .set({ clientId: newClientId })
    .then(() => newClientId);
}

export { getClientId };
