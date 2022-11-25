import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

describe("appendMessage", () => {
  beforeAll(() => {
    document.body.innerHTML = `
      <div id="message-box"></div>

      <button id="copy-current-tab-button">Copy Current Tab</button>
      <button id="copy-selected-tabs-button">Copy Selected Tabs</button>
    `;

    require("./../popup.js");
  })

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


    const user = userEvent.setup()
    const button = screen.getByRole('button', { name: 'Copy Current Tab' })
    await user.click(button);

    // const message = await screen.findByText('Copied')
    const message = await screen.getByText('Copied')
    expect(message).toBeTruthy()
  });

  describe("When clicking copy selected tab button", () => {
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
            { title: "fuga", url: "https://fuga.example.com" },
          ]);
        }),
      };
    });

    test("show the message", async () => {
      const user = userEvent.setup()
      const button = screen.getByRole('button', { name: 'Copy Selected Tabs' })
      await user.click(button)

      const message = await screen.getByText('Copied Selected Tabs!')
      expect(message).toBeTruthy()
    })

  })
});
