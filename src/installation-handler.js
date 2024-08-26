import { sendTrackEvent } from "./google-analytics"

export async function installationHandler({ previousVersion, reason }) {
  const { version } = chrome.runtime.getManifest()

  if (reason === 'install') {
    return sendTrackEvent({ name: 'installed', params: { version } })
      .then(() => chrome.storage.local.set({ lastInstalledVersion: version }))
      .then(() => console.debug(`lastInstalledVersion is set: ${version}`))
  } else if (reason === 'update') {
    chrome.storage.local.get('lastInstalledVersion')
    .then(({ lastInstalledVersion }) => {
      if (lastInstalledVersion) {
        console.debug(`lastInstalledVersion is ${lastInstalledVersion}`)
        return sendTrackEvent({ name: 'updated', params: { version, previousVersion } })
      }

      return sendTrackEvent({ name: 'installed', params: { version } })
        .then(() => chrome.storage.local.set({ lastInstalledVersion: version }))
    })
  }
}