let messageBox = document.getElementById('message-box');
let copyCurrentTabButton = document.getElementById('copy-current-tab-button');
let copySelectedTabsButton = document.getElementById('copy-selected-tabs-button');

function createLinksForTabs(tabs) {
  return tabs.map(tab => ` [${tab.url} ${tab.title}]`).join("\n")
}

function writeTextToClipboard(text) {
  return navigator.clipboard.writeText(text)
}

function appendMessage(messageElement) {
  messageBox.appendChild(messageElement)
}

function findTabs(queryOption) {
  return chrome.tabs.query(queryOption)
}

copyCurrentTabButton.addEventListener('click', () => {
  findTabs({ active: true, currentWindow: true })
    .then(([tab]) => {
      let linkText = createLinksForTabs([tab])

      writeTextToClipboard(linkText).then(() => {
        let element = document.createElement('p')
        element.innerText = 'Copied!'
        appendMessage(element)
      })
    })
    .catch((err) => console.error(err))
});

copySelectedTabsButton.addEventListener('click', () => {
  findTabs({ highlighted: true, currentWindow: true })
    .then(tabs => {
      let linkText = createLinksForTabs(tabs)

      writeTextToClipboard(linkText).then(() => {
        let element = document.createElement('p')
        element.innerText = 'Copied Selected Tabs!'
        appendMessage(element)
      })
    })
    .catch((err) => console.error(err))
})