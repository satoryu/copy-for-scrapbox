let messageBox = document.getElementById('message-box');
let copyCurrentTabButton = document.getElementById('copy-current-tab-button');
let copySelectedTabsButton = document.getElementById('copy-selected-tabs-button');

copyCurrentTabButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true })
    .then(([tab]) => {
      let linkText = `[${tab.url} ${tab.title}]`;

      navigator.clipboard.writeText(linkText).then(() => {
        let element = document.createElement('p')
        element.innerText = 'Copied!'
        messageBox.appendChild(element)
      })
    })
    .catch((err) => console.error(err))
});

copySelectedTabsButton.addEventListener('click', () => {
  chrome.tabs.query({ highlighted: true, currentWindow: true })
    .then(tabs => {
      let linkText = tabs.map(tab => ` [${tab.url} ${tab.title}]`).join("\n")

      navigator.clipboard.writeText(linkText).then(() => {
        let element = document.createElement('p')
        element.innerText = 'Copied Selected Tabs!'
        messageBox.appendChild(element)
      })
    })
    .catch((err) => console.error(err))
})