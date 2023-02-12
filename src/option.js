async function setProjectName(projectName) {
  if (projectName == '' || projectName == null) {
    throw new Error('Given project name is empty')
  }

  chrome.storage.sync.set({projectName})
}

async function getProjectName() {
  return chrome.storage.sync.get('projectName')
}

export { setProjectName, getProjectName }
