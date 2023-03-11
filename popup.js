import { writeTextToClipboard } from './src/clipboard.js';
import { getCurrentTab, getSelectedTabs, getAllTabsOnCurrentWindow } from './src/chrome.js';
import { createLinkForTab, createLinksForTabs } from './src/link.js';

let messageBox = document.getElementById('message-box');
let copyCurrentTabButton = document.getElementById('copy-current-tab-button');
let copySelectedTabsButton = document.getElementById('copy-selected-tabs-button');
let copyAllTabsButton = document.getElementById('copy-all-tabs-button')

function appendMessage(messageText) {
  let messageElement = document.createElement('p')
  messageElement.textContent = messageText
  messageBox.appendChild(messageElement)
}

copyCurrentTabButton.addEventListener('click', () => {
  getCurrentTab()
    .then(([tab]) => {
      let linkText = createLinkForTab(tab)

      writeTextToClipboard(linkText).then(() => {
        appendMessage('Copied')
      })
    })
    .catch((err) => console.error(err))
});

copySelectedTabsButton.addEventListener('click', () => {
  getSelectedTabs()
    .then(tabs => {
      let linkText = createLinksForTabs(tabs)

      writeTextToClipboard(linkText).then(() => {
        appendMessage('Copied Selected Tabs!')
      })
    })
    .catch((err) => console.error(err))
})

copyAllTabsButton.addEventListener('click', () => {
  getAllTabsOnCurrentWindow()
    .then(tabs => {
      let linkText = createLinksForTabs(tabs)

      writeTextToClipboard(linkText).then(() => {
        appendMessage('Copied All Tabs!')
      })
    })
})
