import { setProjectName, getProjectName } from "../src/option.js";

global.chrome = {
  storage: {
    sync: {
      set: jest.fn((val) => val),
    },
  },
};

describe("setProjectName", () => {
  test("setProjectName stores given project name to chrome.sync.set", async () => {
    const projectName = "satoryu1981";

    await setProjectName(projectName);

    expect(chrome.storage.sync.set.mock.calls[0][0]).toEqual({ projectName });
  });

  describe("When giving invalid project name", () => {
    test("throw error object if the project name is empty", async () => {
      await expect(setProjectName('')).rejects.toThrow(new Error("Given project name is empty"))
      expect(chrome.storage.sync.set.mock.calls[0]).toBeUndefined()
    })
    test("throw error object if the project name is null", async () => {
      await expect(setProjectName(null)).rejects.toThrow(new Error("Given project name is empty"))
      expect(chrome.storage.sync.set.mock.calls[0]).toBeUndefined()
    })
    test("throw error object if the project name is undefined", async () => {
      await expect(setProjectName(undefined)).rejects.toThrow(new Error("Given project name is empty"))
      expect(chrome.storage.sync.set.mock.calls[0]).toBeUndefined()
    })
  })
});

describe("getProjectName", () => {
  test("fetches project name from chrome.sync.get", async () => {
    const expected = 'satoryu0729'
    chrome.storage.sync.get = jest.fn((key) => expected)

    const actualProjectName = await getProjectName()

    expect(actualProjectName).toEqual(expected)
    expect(chrome.storage.sync.get.mock.calls[0][0]).toEqual('projectName')
  })
})
