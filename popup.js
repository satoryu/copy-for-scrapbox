import { writeTextToClipboard } from './src/clipboard.js';
import { findTabs } from './src/chrome.js';
import { createLinksForTabs } from './src/link.js';

let messageBox = document.getElementById('message-box');
let copyCurrentTabButton = document.getElementById('copy-current-tab-button');
let copySelectedTabsButton = document.getElementById('copy-selected-tabs-button');

function appendMessage(messageText) {
  let messageElement = document.createElement('p')
  messageElement.innerText = messageText
  messageBox.appendChild(messageElement)
}

copyCurrentTabButton.addEventListener('click', () => {
  findTabs({ active: true, currentWindow: true })
    .then(([tab]) => {
      let linkText = createLinksForTabs([tab])

      writeTextToClipboard(linkText).then(() => {
        appendMessage('Copied')
      })
    })
    .catch((err) => console.error(err))
});

copySelectedTabsButton.addEventListener('click', () => {
  findTabs({ highlighted: true, currentWindow: true })
    .then(tabs => {
      let linkText = createLinksForTabs(tabs)

      writeTextToClipboard(linkText).then(() => {
        appendMessage('Copied Selected Tabs!')
      })
    })
    .catch((err) => console.error(err))
})