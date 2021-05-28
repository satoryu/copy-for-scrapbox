let messageBox = document.getElementById('message-box');
let copyButton = document.getElementById('copy-button');

copyButton.addEventListener('click', () => {
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
