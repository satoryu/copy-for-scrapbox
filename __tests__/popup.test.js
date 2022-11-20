import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

describe("appendMessage", () => {
  test("insert p tag to show a given message", async () => {
    jest.mock("../src/clipboard", () => {
      return {
        writeTextToClipboard: jest.fn(() => {
          return Promise.resolve("hoge");
        }),
      };
    });
    jest.mock("../src/chrome.js", () => {
      return {
        findTabs: jest.fn(() => {
          return Promise.resolve([
            { title: "hoge", url: "https://www.example.com" },
          ]);
        }),
      };
    });

    document.body.innerHTML = `
      <div id="message-box"></div>

      <button id="copy-current-tab-button">Copy Current Tab</button>
      <button id="copy-selected-tabs-button">Copy Selected Tabs</button>
    `;

    require("./../popup.js");

    const user = userEvent.setup()
    const button = screen.getByRole('button', { name: 'Copy Current Tab' })
    await user.click(button);

    await waitFor(() => {
      const message = document.getElementById('message-box').firstChild.innerText
      expect(message).toEqual('Copied')
    })
  });
});
