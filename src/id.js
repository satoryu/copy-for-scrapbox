import { v4 as uuid } from "uuid";

const SESSION_EXPIRATION = 30 * 60 * 1000 // msec of 30 min

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

async function getSessionId() {
  let { sessionData } = await chrome.storage.session.get('sessionData')
  const currentTime = Date.now()

  if (sessionData && sessionData.timestamp) {
    const duration = (currentTime - sessionData.timestamp)

    if (duration > SESSION_EXPIRATION) {
      sessionData = null
    } else {
      sessionData.timestamp = currentTime
      await chrome.storage.session.set({sessionData})
    }
  }

  if (!sessionData) {
    sessionData = {
      session_id: currentTime.toString(),
      timestamp: currentTime.toString()
    }
    await chrome.storage.session.set({sessionData})
  }

  return sessionData.session_id
}

async function getUserId() {
  const result = await chrome.storage.sync.get('userId')
  const userId = result.userId

  if (userId) {
    return userId
  }

  const newUserId = uuid()

  return chrome.storage.sync
    .set({ userId: newUserId })
    .then(() => (newUserId))
}

export { getClientId, generateClientId, getSessionId, getUserId };
