function writeTextToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export { writeTextToClipboard }
