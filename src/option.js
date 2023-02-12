async function setProjectName(projectName) {
  if (projectName == '' || projectName == null) {
    throw new Error('Given project name is empty')
  }

  chrome.storage.sync.set({projectName})
}

async function getProjectName() {
  const options = chrome.storage.sync.get('projectName')

  return options.projectName
}

export { setProjectName, getProjectName }
