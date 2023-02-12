import { getProjectName, setProjectName } from './src/option.js'

const projectNameInput = document.getElementById('projectName')
const saveButton = document.getElementById('save')

document.addEventListener('DOMContentLoaded', function () {
  getProjectName().then( (projectName) => {
    if (projectName) {
      projectNameInput.value = projectName
    }
  })
})

saveButton.addEventListener('click', function () {
  setProjectName(projectNameInput.value).then(() => { alert('Saved') })
})
