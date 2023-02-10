async function generateScrapboxPageContent(doc, projectName) {
  return { title: doc.title, projectName }
}

export { generateScrapboxPageContent }