async function setProjectName(projectName) {
  if (projectName == '' || projectName == null) {
    throw new Error('Given project name is empty')
  }

  chrome.storage.sync.set({projectName})
}

export { setProjectName }
