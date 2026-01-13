# Copy for Scrapbox

This is a Chrome extension which helps [scrapbox](https://scrapbox.io/) users to create a link.
Users can generate a link to the page in the current tab in Scrapbox format and copy it to their clipboad.

## Features

This extension helps you copy the following things as Scrapbox format to your clipboard:

- Current tab as link
- Selected tabs as a list of links

## DEMO

Please take a look at [this demo](https://www.youtube.com/watch?v=prKgvy8d9-c).

## Install

Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/copy-for-scrapbox/kalhokahkhkmbkiliieonfdmdeajlnog) and Click `Add to Chrome` button.

## Development

### Running Tests

```bash
# Run all tests (utils + components)
npm test

# Run only utility tests
npm run test:utils

# Run only component tests
npm run test:components

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Type Checking

```bash
npm run compile
```

### Building

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Create distributable ZIP
npm run zip
```

For more information about development, see [CLAUDE.md](./CLAUDE.md).

## License

This extension is available as open source under the terms of [MIT License](https://github.com/satoryu/copy-for-scrapbox/blob/main/LICENSE).
