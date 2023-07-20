import { v4 as uuid } from "uuid";

const SESSION_EXPIRATION = 30 * 60 * 1000 // msec of 30 min

async function getOrGenerateId(idName, storage) {
  const result = await storage.get(idName)
  const id = result[idName]

  if (id) {
    return id
  }

  const newId = uuid()

  return storage.set({ [idName]: newId }).then(() => newId)
}

async function getClientId() {
  return getOrGenerateId('clientId', chrome.storage.local)
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
  return getOrGenerateId('userId', chrome.storage.sync)
}

export { getClientId, getSessionId, getUserId };
