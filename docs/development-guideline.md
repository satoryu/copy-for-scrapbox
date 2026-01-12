# Development Guidelines

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Test-Driven Development (TDD)](#test-driven-development-tdd)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Git Workflow](#git-workflow)
7. [Common Development Tasks](#common-development-tasks)
8. [Debugging](#debugging)
9. [Code Review Guidelines](#code-review-guidelines)
10. [Release Process](#release-process)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js 20+** - Runtime environment
- **npm** - Package manager (comes with Node.js)
- **Git** - Version control
- **Chrome or Firefox** - For testing the extension

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/satoryu/copy-for-scrapbox.git
cd copy-for-scrapbox

# Install dependencies
npm install

# Run tests to verify setup
npm test

# Start development server
npm run dev
```

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3/` directory
5. The extension should now appear in your browser

### Loading the Extension in Firefox

```bash
# Start Firefox development mode
npm run dev:firefox
```
Firefox will automatically open with the extension loaded.

---

## Development Workflow

### Standard Development Cycle

This project follows **Test-Driven Development (TDD)** practices. The standard workflow is:

```
1. Write failing test (Red)
   ↓
2. Write minimal code to pass test (Green)
   ↓
3. Refactor while keeping tests green (Refactor)
   ↓
4. Type check with TypeScript
   ↓
5. Manual testing in browser
   ↓
6. Commit changes
```

### Daily Development Commands

```bash
# Development with hot reload
npm run dev              # Chrome
npm run dev:firefox      # Firefox

# Testing
npm test                 # Run all tests once
npm run test:watch       # Watch mode (recommended during development)

# Type checking
npm run compile          # Check TypeScript types

# Build for production
npm run build            # Chrome
npm run build:firefox    # Firefox

# Create distribution package
npm run zip              # Chrome Web Store
npm run zip:firefox      # Firefox Add-ons
```

---

## Test-Driven Development (TDD)

### Core Principle

**⚠️ CRITICAL: Always write tests BEFORE implementation**

This project strictly follows TDD practices. Writing tests first:
- Defines the API contract before implementation
- Ensures testability
- Provides living documentation
- Catches regressions immediately
- Enables confident refactoring

### TDD Cycle: Red-Green-Refactor

#### 🔴 Red - Write a Failing Test

**Before writing any production code**, write a test that fails:

```javascript
// Example: Adding a new function to utils/link.ts
// Step 1: Write the test FIRST in utils/link.test.js

import { describe, it, expect } from 'vitest';
import { removeEmoji } from './link';

describe('removeEmoji', () => {
  it('should remove emoji from title', () => {
    expect(removeEmoji('Hello 👋 World')).toBe('Hello  World');
  });
});
```

Run the test to confirm it fails:
```bash
npm test
# ❌ FAIL: removeEmoji is not defined
```

#### 🟢 Green - Make the Test Pass

Write **minimal code** to make the test pass:

```typescript
// Step 2: Implement in utils/link.ts
export function removeEmoji(title: string): string {
  return title.replace(/[\u{1F000}-\u{1F9FF}]/gu, '');
}
```

Run tests again:
```bash
npm test
# ✅ PASS: All tests passing
```

#### ♻️ Refactor - Improve the Code

Clean up the code while keeping tests green:

```typescript
// Step 3: Improve implementation
export function removeEmoji(title: string): string {
  // More comprehensive emoji regex
  const emojiRegex = /[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}]/gu;
  return title.replace(emojiRegex, '');
}
```

Run tests after each change:
```bash
npm test
# ✅ PASS: All tests still passing
```

### TDD Workflow Examples

#### Example 1: Adding a Utility Function

```bash
# ❌ WRONG: Don't do this
vim utils/newfeature.ts        # Writing code first

# ✅ CORRECT: Do this
vim utils/newfeature.test.ts   # 1. Write test first
npm test                        # 2. See it fail (Red)
vim utils/newfeature.ts        # 3. Write implementation
npm test                        # 4. See it pass (Green)
vim utils/newfeature.ts        # 5. Refactor if needed
npm test                        # 6. Verify still passing
```

#### Example 2: Fixing a Bug

```bash
# 1. Write a test that reproduces the bug
vim utils/link.test.js
# Add test case that currently fails

# 2. Verify the test fails
npm test
# ❌ Test should fail, confirming the bug

# 3. Fix the bug
vim utils/link.ts

# 4. Verify the fix
npm test
# ✅ Test should now pass
```

#### Example 3: Adding a React Component

```bash
# 1. Test the underlying logic first
vim entrypoints/popup/components/MyButton.test.tsx
npm test  # Should fail

# 2. Implement component with minimal logic
vim entrypoints/popup/components/MyButton.tsx

# 3. Extract complex logic to utils/ with tests
vim utils/myfeature.test.ts
vim utils/myfeature.ts

# 4. Verify all tests pass
npm test
```

### TDD Best Practices

1. **One Test Per Behavior**
   - Each test should verify one specific behavior
   - Use descriptive test names: `it('should remove square brackets from title')`

2. **Test File Location**
   - Place tests next to source files
   - `link.ts` → `link.test.js` or `link.test.ts`
   - Same directory structure

3. **Use Watch Mode**
   ```bash
   npm run test:watch
   ```
   Tests re-run automatically on file changes

4. **Mock Browser APIs**
   ```javascript
   import { browser } from 'wxt/testing';

   // Mock is automatically provided by WxtVitest
   browser.tabs.query.mockResolvedValue([{ id: 1, title: 'Test' }]);
   ```

5. **Test Edge Cases**
   - Empty strings
   - Special characters
   - Unicode
   - Null/undefined
   - Maximum values

### When TDD Is Challenging

In rare cases, TDD might be difficult:
- Initial UI layout exploration
- Extension permissions setup
- Manifest configuration

**However**, even in these cases:
- Add tests after implementation
- Extract and test any logic from UI
- Test integration points

---

## Coding Standards

### TypeScript

#### Type Safety
- **Always use TypeScript** for new code
- Enable strict mode (inherited from WXT config)
- Avoid `any` type - use `unknown` if truly dynamic

```typescript
// ❌ Bad
function process(data: any) { }

// ✅ Good
function process(data: Browser.tabs.Tab) { }
```

#### Type Imports
```typescript
// Use type imports when importing only types
import type { ClipboardHistoryItem } from '../../utils/history';

// Regular import for values
import { getHistory } from '../../utils/history';
```

#### Browser API Types
WXT provides built-in types:
```typescript
// Tabs
globalThis.Browser.tabs.Tab
globalThis.Browser.tabs.query

// Context Menus
globalThis.Browser.contextMenus.OnClickData
globalThis.Browser.contextMenus.ContextType
```

### React

#### Functional Components
**Always use functional components** with hooks:

```typescript
// ✅ Good
const MyComponent: React.FC<Props> = ({ onCopied }) => {
  const [state, setState] = useState<string>('');

  return <div>{state}</div>;
};

// ❌ Bad - Don't use class components
class MyComponent extends React.Component { }
```

#### Props Pattern
```typescript
interface Props {
  onCopied: (message: string) => void;
}

const MyButton: React.FC<Props> = ({ onCopied }) => {
  const handleClick = async () => {
    // Logic here
    onCopied('Success!');
  };

  return <button onClick={handleClick}>Copy</button>;
};
```

#### Component File Structure
```typescript
// 1. Imports
import React, { useState } from 'react';

// 2. Type definitions
interface Props {
  // ...
}

// 3. Component
const MyComponent: React.FC<Props> = (props) => {
  // Hooks
  const [state, setState] = useState();

  // Event handlers
  const handleClick = () => { };

  // Render
  return <div>...</div>;
};

// 4. Export
export default MyComponent;
```

### Async/Await

**Always use async/await** instead of raw promises:

```typescript
// ✅ Good
async function copyTab() {
  const tabs = await browser.tabs.query({ active: true });
  const link = await createLinkForTab(tabs[0]);
  await writeTextToClipboard(link);
}

// ❌ Bad
function copyTab() {
  browser.tabs.query({ active: true })
    .then(tabs => createLinkForTab(tabs[0]))
    .then(link => writeTextToClipboard(link));
}
```

### Naming Conventions

#### Files
- **React components**: PascalCase.tsx (`CopyCurrentTabButton.tsx`)
- **Utilities**: camelCase.ts (`clipboard.ts`, `link.ts`)
- **Tests**: Match source with `.test.js` or `.test.ts` (`link.test.js`)
- **Config files**: lowercase with dots (`wxt.config.ts`, `vitest.config.ts`)

#### Variables and Functions
- **camelCase** for variables and functions
- **PascalCase** for React components and classes
- **UPPER_SNAKE_CASE** for constants

```typescript
// Variables
const clipboardHistory = [];
const MAX_HISTORY_ITEMS = 100;

// Functions
async function writeTextToClipboard(text: string) { }

// Components
const CopyButton: React.FC = () => { };

// Classes
class HandlerRepository { }
```

### Code Organization

#### Function Length
- Keep functions small (ideally < 20 lines)
- Single responsibility principle
- Extract complex logic to separate functions

#### File Length
- Keep files focused (< 200 lines ideal)
- Split large components into smaller ones
- Extract shared logic to utils

#### Import Order
```typescript
// 1. External libraries
import React, { useState } from 'react';

// 2. WXT/Browser
import { browser } from 'wxt/browser';

// 3. Internal utilities (absolute paths)
import { createLinkForTab } from '@/utils/link';

// 4. Components (relative paths)
import CopyButton from './components/CopyButton';

// 5. Types
import type { Props } from './types';
```

### Comments

#### When to Comment
- Complex algorithms
- Non-obvious business logic
- Workarounds for browser bugs

#### When NOT to Comment
- Self-explanatory code
- What the code does (code should be self-documenting)
- Redundant information

```typescript
// ❌ Bad - Obvious comment
// Get the current tab
const tab = await getCurrentTab();

// ✅ Good - Explains "why"
// Remove square brackets because they break Scrapbox's link syntax
const sanitizedTitle = title.replaceAll(/[\[\]]/g, '');
```

---

## Testing Guidelines

> **📖 For comprehensive testing strategy including coverage goals, test layers, tools, and implementation roadmap, see [testing.md](testing.md)**

This section covers practical testing guidelines for writing tests.

### Test Structure

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ModuleName', () => {
  describe('functionName', () => {
    it('should handle normal case', () => {
      const result = functionName('input');
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      const result = functionName('');
      expect(result).toBe('');
    });

    it('should throw error for invalid input', () => {
      expect(() => functionName(null)).toThrow();
    });
  });
});
```

### Testing Browser APIs

Use WxtVitest plugin for automatic mocking:

```javascript
import { browser } from 'wxt/testing';

describe('tabs module', () => {
  it('should query current tab', async () => {
    // Mock the browser API
    browser.tabs.query.mockResolvedValue([
      { id: 1, title: 'Test Tab', url: 'https://example.com' }
    ]);

    const tab = await getCurrentTab();

    expect(tab.title).toBe('Test Tab');
    expect(browser.tabs.query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true
    });
  });
});
```

### Testing i18n

```javascript
import { browser } from 'wxt/testing';

describe('i18n', () => {
  beforeEach(() => {
    browser.i18n.getMessage.mockImplementation((key) => {
      const messages = {
        'extensionName': 'Copy for Scrapbox',
        'copySuccess': 'Copied!'
      };
      return messages[key] || key;
    });
  });

  it('should get message', () => {
    const message = browser.i18n.getMessage('copySuccess');
    expect(message).toBe('Copied!');
  });
});
```

### Test Coverage Goals

- **Utility functions**: 100% coverage
- **Edge cases**: All critical paths
- **Browser API interactions**: Mock and verify
- **Error handling**: Test failure scenarios

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode (recommended)
npm run test:watch

# Run specific test file
npm test -- link.test.js

# Run with coverage
npm test -- --coverage
```

---

## Git Workflow

### Branch Strategy

- **`main`** - Protected branch, production-ready code
- **Feature branches** - `feature/description` or `fix/description`
- **All changes via Pull Requests**

### Creating a Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/add-emoji-filter

# Make changes with TDD workflow
# (Write tests, implement, commit)

# Push to remote
git push -u origin feature/add-emoji-filter

# Create pull request on GitHub
```

### Commit Message Guidelines

Follow conventional commits style:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

**Examples**:
```bash
git commit -m "feat: add emoji filtering to link titles"
git commit -m "fix: handle undefined tab titles correctly"
git commit -m "test: add edge cases for link formatting"
git commit -m "docs: update architecture documentation"
```

### Pre-Commit Checklist

Before committing, ensure:

1. ✅ All tests pass: `npm test`
2. ✅ TypeScript compiles: `npm run compile`
3. ✅ Manual testing in browser completed
4. ✅ i18n messages updated (if UI text changed)
5. ✅ Commit message is descriptive

### Pull Request Guidelines

#### Before Creating PR

```bash
# Ensure branch is up to date
git fetch origin
git rebase origin/main

# Run full test suite
npm test

# Type check
npm run compile

# Build to verify no errors
npm run build
```

#### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Checklist
- [ ] Tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run compile`)
- [ ] i18n messages updated (if applicable)
- [ ] Documentation updated (if applicable)
```

---

## Common Development Tasks

### Adding a New Popup Button

Follow TDD workflow:

1. **Write test for underlying logic** (if testable)
   ```bash
   vim utils/myfeature.test.ts
   npm test  # Should fail
   ```

2. **Implement utility function**
   ```bash
   vim utils/myfeature.ts
   npm test  # Should pass
   ```

3. **Create React component**
   ```bash
   vim entrypoints/popup/components/MyButton.tsx
   ```

   ```typescript
   import React from 'react';

   interface Props {
     onCopied: (message: string) => void;
   }

   const MyButton: React.FC<Props> = ({ onCopied }) => {
     const handleClick = async () => {
       // Use utility function
       const result = await myFeature();
       await writeTextToClipboard(result);
       onCopied(browser.i18n.getMessage('myFeatureSuccess'));
     };

     return (
       <button onClick={handleClick}>
         {browser.i18n.getMessage('myFeatureButton')}
       </button>
     );
   };

   export default MyButton;
   ```

4. **Add i18n messages**
   ```bash
   # Update all 4 locale files
   vim public/_locales/en/messages.json
   vim public/_locales/ja/messages.json
   vim public/_locales/zh_CN/messages.json
   vim public/_locales/zh_TW/messages.json
   ```

   ```json
   {
     "myFeatureButton": {
       "message": "My Feature"
     },
     "myFeatureSuccess": {
       "message": "Success!"
     }
   }
   ```

5. **Add to App.tsx**
   ```typescript
   import MyButton from './components/MyButton';

   <MyButton onCopied={appendMessage} />
   ```

6. **Test manually**
   ```bash
   npm run dev
   # Load extension and test button
   ```

### Adding a Context Menu Item

1. **Write test for handler logic**
   ```bash
   vim utils/myhandler.test.ts
   npm test  # Should fail
   ```

2. **Implement handler**
   ```bash
   vim utils/myhandler.ts
   npm test  # Should pass
   ```

3. **Register in context menu**
   ```typescript
   // entrypoints/context_menu/index.ts
   repository.registerHandler({
     id: 'my-menu-item',
     title: '__MSG_myMenuItem__',
     contexts: ['page'],  // or ['selection'], ['link'], etc.
     handler: async (info, tab) => {
       const result = await myHandler(info, tab);
       const tabId = tab.id;
       if (tabId === undefined) return;

       await browser.scripting.executeScript({
         target: { tabId },
         func: writeTextToClipboard,
         args: [result]
       });
     }
   });
   ```

4. **Add i18n messages**
   ```json
   {
     "myMenuItem": {
       "message": "My Menu Item"
     }
   }
   ```

5. **Test**
   ```bash
   npm run dev
   # Right-click on page and verify menu item appears
   ```

### Modifying Link Format

**⚠️ CRITICAL: Always use TDD for link formatting changes**

1. **Write failing test FIRST**
   ```javascript
   // utils/link.test.js
   it('should handle new format requirement', () => {
     const result = createLinkForTab({
       url: 'https://example.com',
       title: 'Test [Brackets]'
     });
     expect(result).toBe('[https://example.com Test Brackets]');
   });
   ```

   ```bash
   npm test  # Should fail
   ```

2. **Implement in utils/link.ts**
   ```typescript
   async function createLinkForTab(tab: Browser.tabs.Tab): Promise<string> {
     const title = (tab.title || '')
       .replaceAll(/[\[\]]/g, '')  // Remove brackets
       .replaceAll(/`(.*)`/g, '$1');  // Remove backticks

     return `[${tab.url} ${title}]`;
   }
   ```

3. **Verify tests pass**
   ```bash
   npm test  # Should pass
   ```

4. **Add more edge cases**
   ```javascript
   it('should handle unicode characters', () => { });
   it('should handle very long titles', () => { });
   it('should handle empty titles', () => { });
   ```

5. **Manual testing**
   ```bash
   npm run dev
   # Test with various URL/title combinations
   ```

### Adding a New Locale

1. **Create locale directory**
   ```bash
   mkdir -p public/_locales/fr
   ```

2. **Copy and translate messages**
   ```bash
   cp public/_locales/en/messages.json public/_locales/fr/messages.json
   vim public/_locales/fr/messages.json
   # Translate all messages
   ```

3. **Test locale**
   - Change Chrome language to French
   - Reload extension
   - Verify all text appears in French

---

## Debugging

### Popup Debugging

1. **Open popup**
2. **Right-click on popup** → "Inspect"
3. **DevTools opens** with popup context
4. **Use Console, Network, Elements tabs**

```typescript
// Add console.log for debugging
const handleClick = async () => {
  console.log('Button clicked');
  const tabs = await browser.tabs.query({ active: true });
  console.log('Tabs:', tabs);
};
```

### Background Script Debugging

1. Navigate to `chrome://extensions`
2. Find "Copy for Scrapbox"
3. Click **"Inspect service worker"**
4. DevTools opens with background context

```typescript
// background.ts
export default defineBackground(() => {
  console.log('Background script loaded');

  browser.contextMenus.onClicked.addListener((info, tab) => {
    console.log('Menu clicked:', info.menuItemId);
    console.log('Tab:', tab);
  });
});
```

### Content Script Debugging

1. Open page where content script runs
2. **F12** to open DevTools (page context)
3. Content script logs appear in Console

### Side Panel Debugging

1. Open side panel
2. **Right-click in side panel** → "Inspect"
3. DevTools opens with side panel context

### Common Issues

#### "Extension context invalidated"
- **Cause**: Extension reloaded while DevTools open
- **Solution**: Close and reopen DevTools

#### Clipboard not working
- **Cause**: Script injection failed or permissions missing
- **Solution**: Check console for errors, verify `scripting` permission

#### i18n messages not showing
- **Cause**: Message key typo or locale file missing
- **Solution**: Check all locale files have the message key

#### Tests failing in CI but passing locally
- **Cause**: Browser API mocks not configured
- **Solution**: Ensure `WxtVitest()` plugin is in `vitest.config.ts`

---

## Code Review Guidelines

### For Authors

Before requesting review:
1. ✅ Self-review your own changes
2. ✅ All tests passing
3. ✅ TypeScript compiling without errors
4. ✅ Manual testing completed
5. ✅ PR description is complete
6. ✅ i18n messages added (if applicable)

### For Reviewers

Review checklist:
1. **Tests**: Are there tests? Do they follow TDD?
2. **Type Safety**: Any `any` types? Proper TypeScript usage?
3. **Code Quality**: Clean, readable, follows standards?
4. **Performance**: Any unnecessary re-renders or loops?
5. **Security**: Input validation? XSS risks?
6. **i18n**: All user-facing text internationalized?
7. **Documentation**: Complex logic documented?

### Review Comments

Use constructive language:
```markdown
❌ "This is wrong"
✅ "Consider using async/await here for better readability"

❌ "Bad code"
✅ "This could be simplified by extracting a helper function"

❌ "You forgot tests"
✅ "Could you add a test case for the empty string scenario?"
```

---

## Release Process

### Version Bumping

Use semantic versioning:
- **Major** (1.x.x): Breaking changes
- **Minor** (x.1.x): New features
- **Patch** (x.x.1): Bug fixes

```bash
# Update version in package.json
vim package.json
# Change "version": "1.11.0" → "1.12.0"

# Commit version bump
git add package.json
git commit -m "chore: bump version to 1.12.0"
```

### Creating a Release

1. **Ensure all tests pass**
   ```bash
   npm test
   npm run compile
   ```

2. **Build production version**
   ```bash
   npm run build
   npm run zip
   ```

3. **Tag the release**
   ```bash
   git tag v1.12.0
   git push origin v1.12.0
   ```

4. **GitHub Actions automatically**:
   - Runs tests
   - Builds extension
   - Creates GitHub release
   - Uploads ZIP artifact

5. **Manual upload to Chrome Web Store**:
   - Download ZIP from GitHub release
   - Upload to Chrome Web Store Developer Dashboard
   - Submit for review

### Release Checklist

- [ ] Version bumped in `package.json`
- [ ] All tests passing
- [ ] TypeScript compiles
- [ ] Manual testing completed
- [ ] CHANGELOG updated (if exists)
- [ ] Git tag created
- [ ] GitHub release published
- [ ] Chrome Web Store updated

---

## Troubleshooting

### Build Issues

#### `npm install` fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### TypeScript errors after update
```bash
# Regenerate WXT types
npm run postinstall
npm run compile
```

### Testing Issues

#### Tests not running
```bash
# Verify Vitest is installed
npm list vitest

# Check test files are named correctly
# Must end with .test.js or .test.ts
```

#### Browser API mocks not working
```typescript
// Ensure WxtVitest plugin is configured
// vitest.config.ts
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  plugins: [WxtVitest()],
});
```

### Extension Issues

#### Extension not loading
1. Check for errors in `chrome://extensions`
2. Verify build completed successfully
3. Try removing and re-adding extension

#### Hot reload not working
1. Restart `npm run dev`
2. Manually reload extension
3. Check console for WXT errors

#### Context menus not appearing
1. Check `wxt.config.ts` has `contextMenus` permission
2. Verify background script loaded (check service worker)
3. Check browser console for errors

### Runtime Issues

#### Clipboard not working
- Ensure page is HTTPS (required for clipboard API)
- Check `scripting` permission in manifest
- Verify script injection succeeded

#### Storage not persisting
- Check `storage` permission in manifest
- Verify using correct storage API (`local` vs `sync`)
- Check quota limits (5MB for local storage)

---

## Resources

### Official Documentation
- [WXT Documentation](https://wxt.dev/)
- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev/)
- [Vitest Documentation](https://vitest.dev/)

### Project Resources
- [GitHub Repository](https://github.com/satoryu/copy-for-scrapbox)
- [Issue Tracker](https://github.com/satoryu/copy-for-scrapbox/issues)
- [Architecture Documentation](./architecture.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

### Useful Links
- [Scrapbox Help](https://scrapbox.io/help/)
- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Getting Help

### Internal Resources
1. Check this documentation first
2. Review `CLAUDE.md` for AI development guidelines
3. Search existing GitHub issues

### Asking Questions
When asking for help:
1. **Describe the problem** clearly
2. **Share code snippets** (not screenshots of code)
3. **Include error messages** in full
4. **Describe what you've tried**
5. **Mention your environment** (OS, Node version, browser)

### Reporting Bugs
Use the GitHub issue template:
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior.

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome 120]
- Extension Version: [e.g. 1.11.0]
```

---

## Quick Reference

### Most Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run test:watch       # Run tests in watch mode

# Before committing
npm test                 # Run all tests
npm run compile          # Type check

# Release
npm run build            # Production build
npm run zip              # Create distribution package
```

### File Locations

- **Tests**: Next to source files (e.g., `link.test.js`)
- **Components**: `entrypoints/popup/components/` or `entrypoints/sidepanel/components/`
- **Utilities**: `utils/`
- **i18n**: `public/_locales/{locale}/messages.json`
- **Config**: Root directory (`wxt.config.ts`, `vitest.config.ts`)

### Key Principles

1. **Test-Driven Development** - Always write tests first
2. **Type Safety** - Use TypeScript strictly
3. **Minimal Dependencies** - Keep bundle size small
4. **Browser Compatibility** - Use `browser` API, not `chrome`
5. **Internationalization** - Always use i18n for user-facing text

---

**Document Version**: 1.0
**Last Updated**: 2026-01-11
**For Codebase Version**: 1.11.0
