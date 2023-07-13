import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

describe("appendMessage", () => {
  let mockChrome = {}

  beforeAll(() => {
    document.body.innerHTML = `
      <div id="message-box"></div>

      <button id="copy-current-tab-button">Copy Current Tab</button>
      <button id="copy-selected-tabs-button">Copy Selected Tabs (<span id="count-of-selected-tabs">0</span>)</button>
      <button id="copy-all-tabs-button">Copy All Tabs</button>
    `;

    jest.mock("../src/chrome.js", () => mockChrome)
    mockChrome.getSelectedTabs = jest.fn(() => (Promise.resolve([])))

    require("../src/popup.js");
  })

  describe('When click copy current tab button', () => {
    let user

    beforeEach(async () => {
      mockChrome.getCurrentTab = jest.fn(() => {
        return Promise.resolve([
          { title: "hoge", url: "https://www.example.com" },
        ]);
      })

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
      mockChrome.getSelectedTabs = jest.fn(() => {
          return Promise.resolve([
            { title: "hoge", url: "https://www.example.com" },
            { title: "fuga", url: "https://fuga.example.com" },
          ]);
        })
      user = userEvent.setup()
      const button = screen.getByRole('button', { name: 'Copy Selected Tabs ( 0 )' })
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

  describe("When clicking copy all tabs button", () => {
    let user

    beforeEach(async () => {
      mockChrome.getAllTabsOnCurrentWindow = jest.fn(() => {
          return Promise.resolve([
            { title: "foo", url: "https://www.foo.com" },
            { title: "bar", url: "https://www.bar.com" },
          ]);
        })
      user = userEvent.setup()
      const button = screen.getByRole('button', { name: 'Copy All Tabs' })
      await user.click(button)
    })

    test("show message", async () => {
      const message = await screen.getByText('Copied All Tabs!')
      expect(message).toBeTruthy()
    })

    test("writes a list of the links to the clipboard", async () => {
      const clipboardText = await window.navigator.clipboard.readText()
      const expectedText = " [https://www.foo.com foo]\n [https://www.bar.com bar]"

      expect(clipboardText).toEqual(expectedText)
    })
  })
});
