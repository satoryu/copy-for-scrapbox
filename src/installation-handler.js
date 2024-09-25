import { sendTrackEvent } from "./google-analytics"

async function saveLastInstalledVersion() {
  const { version } = chrome.runtime.getManifest()

  return chrome.storage.local.set({ lastInstalledVersion: version })
}

async function getLastInstalledVersion() {
  return chrome.storage.local.get('lastInstalledVersion')
    .then(({ lastInstalledVersion }) => lastInstalledVersion)
}

export async function installationHandler({ previousVersion, reason }) {
  const { version } = chrome.runtime.getManifest()

  if (reason === 'install') {
    await sendTrackEvent({ name: 'custom-installed', params: { version } })
      .then(saveLastInstalledVersion)
      .then(() => console.debug(`lastInstalledVersion is set: ${version}`))
  } else if (reason === 'update') {
    await getLastInstalledVersion()
    .then((lastInstalledVersion) => {
      // if already installed, just update the version
      if (lastInstalledVersion) {
        console.debug(`lastInstalledVersion is ${lastInstalledVersion}`)
        sendTrackEvent({ name: 'custom-updated', params: { version, previousVersion } })
        return
      }

      sendTrackEvent({ name: 'custom-installed', params: { version } })
        .then(saveLastInstalledVersion)
    })
  }
}