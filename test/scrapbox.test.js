import { generateScrapboxPageContent } from '../src/scrapbox.js';

describe('generateScrapboxPageContent', () => {
  test("content's title equals to the document's title", async () => {
    let projectName = 'satoryu1981';
    document.title = 'hogehoge'

    const content = await generateScrapboxPageContent(document, projectName)

    expect(content.title).toEqual(document.title)
    expect(content.projectName).toEqual(projectName)
  })
})
