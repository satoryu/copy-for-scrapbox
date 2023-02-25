import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

describe("appendMessage", () => {
  let mockChrome = {}

  beforeAll(() => {
    document.body.innerHTML = `
      <div id="message-box"></div>

      <button id="copy-current-tab-button">Copy Current Tab</button>
      <button id="copy-selected-tabs-button">Copy Selected Tabs</button>
      <button id="copy-all-tabs-button">Copy All Tabs</button>
    `;

    jest.mock("../src/chrome.js", () => mockChrome)

    require("./../popup.js");
  })

  describe('When click copy current tab button', () => {
    let user

    beforeEach(async () => {
      mockChrome.findTabs = jest.fn(() => {
        return Promise.resolve([
          { title: "hoge", url: "https://www.example.com" },
        ]);
      }),

      user = userEvent.setup()
      const button = screen.getByRole('button', { name: 'Copy Current Tab' })
      await user.click(button);
    })

    test("insert p tag to show a given message", async () => {
      const message = await screen.getByText('Copied')

      expect(message).toBeTruthy()
    });

    test('writes the link to the clipboard', async () => {
      const clipboardText = await window.navigator.clipboard.readText()

      expect(clipboardText).toEqual('[https://www.example.com hoge]')
    })
  })

  describe("When clicking copy selected tab button", () => {
    let user

    beforeEach(async () => {
      mockChrome.findTabs = jest.fn(() => {
          return Promise.resolve([
            { title: "hoge", url: "https://www.example.com" },
            { title: "fuga", url: "https://fuga.example.com" },
          ]);
        })
      user = userEvent.setup()
      const button = screen.getByRole('button', { name: 'Copy Selected Tabs' })
      await user.click(button)
    })

    test("show the message", async () => {
      const message = await screen.getByText('Copied Selected Tabs!')
      expect(message).toBeTruthy()
    })

    test('writes a list of the links to the clipboard', async () => {
      const clipboardText = await window.navigator.clipboard.readText()
      const expectedText = " [https://www.example.com hoge]\n [https://fuga.example.com fuga]"

      expect(clipboardText).toEqual(expectedText)
    })
  })
});
