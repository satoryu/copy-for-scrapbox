import { writeTextToClipboard } from './clipboard';
import { getCurrentTab, getSelectedTabs, getAllTabsOnCurrentWindow } from './tabs';
import { createLinkForTab, createLinksForTabs } from './link';
import './popup.css'

let messageBox = document.getElementById('message-box');
let copyCurrentTabButton = document.getElementById('copy-current-tab-button');
let copySelectedTabsButton = document.getElementById('copy-selected-tabs-button');
let copyAllTabsButton = document.getElementById('copy-all-tabs-button')

function appendMessage(messageText: string) {
  let messageElement = document.createElement('p')
  if (!messageBox) {
    console.error('Message box not found')
    return
  }
  messageElement.textContent = messageText
  messageBox.appendChild(messageElement)
}

if (copyCurrentTabButton) {
  copyCurrentTabButton.addEventListener('click', () => {
    getCurrentTab()
      .then(([tab]) => (createLinkForTab(tab)))
      .then(writeTextToClipboard)
      .then(() => { appendMessage('Copied') })
      .catch((err) => console.error(err))
  });
}

if (copySelectedTabsButton) {
  copySelectedTabsButton.addEventListener('click', () => {
    getSelectedTabs()
      .then(createLinksForTabs)
      .then(writeTextToClipboard)
      .then(() => { appendMessage('Copied Selected Tabs!') })
      .catch((err) => console.error(err))
  })
  const countOfSelectedTabs = document.getElementById('count-of-selected-tabs')
  if (countOfSelectedTabs) {
    getSelectedTabs().then(tabs => {
      countOfSelectedTabs.textContent = tabs.length.toString()
    })
  }
}

if (copyAllTabsButton) {
  copyAllTabsButton.addEventListener('click', () => {
    getAllTabsOnCurrentWindow()
      .then(createLinksForTabs)
      .then(writeTextToClipboard)
      .then(() => { appendMessage('Copied All Tabs!') })
  })
}