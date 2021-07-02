function writeTextToClipboard(text) {
  return navigator.clipboard.writeText(text)
}

export { writeTextToClipboard }
