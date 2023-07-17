import { writeTextToClipboard } from './clipboard.js';
import { getCurrentTab, getSelectedTabs, getAllTabsOnCurrentWindow } from './chrome.js';
import { createLinkForTab, createLinksForTabs } from './link.js';
import './popup.scss'
import { sendTrackEvent } from './google-analytics.js';

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
    .then(([tab]) => (createLinkForTab(tab)))
    .then(writeTextToClipboard)
    .then(() => { appendMessage('Copied') })
    .then(() => (sendTrackEvent({name: 'button_click', params: { id: 'copy-current-tab' }})))
    .catch((err) => console.error(err))
});

copySelectedTabsButton.addEventListener('click', () => {
  getSelectedTabs()
    .then(createLinksForTabs)
    .then(writeTextToClipboard)
    .then(() => { appendMessage('Copied Selected Tabs!') })
    .then(() => (sendTrackEvent({name: 'button_click', params: { id: 'copy-selected-tabs' }})))
    .catch((err) => console.error(err))
})
const countOfSelectedTabs = document.getElementById('count-of-selected-tabs')
if (countOfSelectedTabs) {
  getSelectedTabs().then(tabs => {
    countOfSelectedTabs.textContent = tabs.length
  })
}

copyAllTabsButton.addEventListener('click', () => {
  getAllTabsOnCurrentWindow()
    .then(createLinksForTabs)
    .then(writeTextToClipboard)
    .then(() => { appendMessage('Copied All Tabs!') })
    .then(() => (sendTrackEvent({name: 'button_click', params: { id: 'copy-all-tabs' }})))
})

window.addEventListener('load', () => {
  sendTrackEvent({
    name: 'page_view',
    params: {
      page_title: document.title,
      page_location: document.location.href
    }
  })
})