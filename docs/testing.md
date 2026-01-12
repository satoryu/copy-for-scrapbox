# Testing Strategy

## Table of Contents

1. [Introduction](#introduction)
2. [Testing Goals & Principles](#testing-goals--principles)
3. [Testing Pyramid & Coverage Goals](#testing-pyramid--coverage-goals)
4. [Unit Testing Strategy](#unit-testing-strategy)
5. [Component Testing Strategy](#component-testing-strategy)
6. [Integration Testing Strategy](#integration-testing-strategy)
7. [End-to-End Testing Strategy](#end-to-end-testing-strategy)
8. [Testing Tools & Setup](#testing-tools--setup)
9. [Test Organization & Naming Conventions](#test-organization--naming-conventions)
10. [Mocking Strategy](#mocking-strategy)
11. [CI/CD Integration](#cicd-integration)
12. [Test Maintenance](#test-maintenance)
13. [Implementation Roadmap](#implementation-roadmap)

---

## Introduction

This document defines the comprehensive testing strategy for the **Copy for Scrapbox** Chrome extension. Our testing approach follows **Test-Driven Development (TDD)** principles and aims to ensure high code quality, prevent regressions, and enable confident refactoring.

### Context

- **Project Type**: Chrome Extension (Manifest V3)
- **Framework**: WXT 0.20.x + React 19
- **Testing Framework**: Vitest 4 with WxtVitest plugin
- **Primary Browser Target**: Chrome (Firefox support maintained but not tested automatically)
- **Current State**: Strong unit test coverage for utilities; component tests need implementation

---

## Testing Goals & Principles

### Primary Goals

1. **80%+ Test Coverage** across the entire codebase
2. **100% Coverage for Critical Paths**: Link formatting, clipboard operations, history management
3. **Prevent Regressions**: All bugs must have corresponding test cases before fixes
4. **Enable Confident Refactoring**: Comprehensive test suite allows safe code improvements
5. **Fast Feedback Loop**: Tests run quickly to support TDD workflow

### Core Principles

#### 1. Test-Driven Development (TDD)

**⚠️ MANDATORY: Write tests BEFORE implementation**

```
Red → Green → Refactor
 ↓      ↓       ↓
Fail → Pass → Improve
```

- Write failing test first (Red)
- Write minimal code to pass (Green)
- Refactor while keeping tests green (Refactor)

#### 2. Test Independence

- Each test runs in isolation
- No shared state between tests
- Tests can run in any order

#### 3. Fast Tests

- Unit tests: < 10ms each
- Component tests: < 50ms each
- E2E tests: < 5s each

#### 4. Readable Tests

- Clear test names describing behavior
- Arrange-Act-Assert pattern
- Minimal setup/teardown code

#### 5. Maintainability

- DRY principle for test utilities
- Keep tests close to source code
- Update tests when requirements change

---

## Testing Pyramid & Coverage Goals

### The Testing Pyramid

```
           /\
          /  \     E2E Tests (5%)
         /    \    - Key user workflows only
        /------\   - Playwright for Chrome only
       /        \
      /          \ Integration Tests (15%)
     /            \ - Module interactions
    /              \ - Context menu handlers
   /----------------\ - Side panel storage sync
  /                  \
 /                    \ Unit Tests (80%)
/______________________\ - Utilities (utils/*)
                         - Pure functions
                         - Browser API wrappers
                         - React hooks
```

### Coverage Goals by Layer

| Layer | Coverage Target | Priority | Status |
|-------|----------------|----------|---------|
| **Utils Layer** | **100%** | Critical | ✅ Strong (needs expansion) |
| **Component Layer** | **80%+** | High | ❌ Not implemented |
| **Integration** | **70%+** | Medium | ❌ Not implemented |
| **E2E** | **Key flows only** | Medium | ❌ Not implemented |
| **Overall** | **80%+** | Required | ⚠️ In progress |

### Critical Paths Requiring 100% Coverage

1. **Link Formatting** (`utils/link.ts`)
   - `createLinkForTab()` - All edge cases
   - `createLinksForTabs()` - Multiple tabs, empty arrays
   - Title sanitization (brackets, backticks, special chars)

2. **Clipboard Operations** (`utils/clipboard.ts`)
   - `writeTextToClipboard()` - Success and error cases
   - History integration

3. **History Management** (`utils/history.ts`)
   - `addToHistory()` - FIFO behavior, limits
   - `getHistory()` - Empty state, full state
   - Storage synchronization

4. **Tab Queries** (`utils/tabs.ts`)
   - All query functions with various tab states
   - Error handling

---

## Unit Testing Strategy

### Scope

Unit tests verify **individual functions and modules** in isolation. They are the foundation of our test suite.

### What to Test

#### 1. Pure Functions (`utils/link.ts`)

**100% coverage required**

```javascript
// Example: utils/link.test.js
describe('createLinkForTab', () => {
  it('should create basic Scrapbox link', async () => {
    const tab = { url: 'https://example.com', title: 'Example' };
    expect(await createLinkForTab(tab)).toBe('[https://example.com Example]');
  });

  it('should remove square brackets from title', async () => {
    const tab = { url: 'https://example.com', title: '[Title]' };
    expect(await createLinkForTab(tab)).toBe('[https://example.com Title]');
  });

  it('should remove backticks from title', async () => {
    const tab = { url: 'https://example.com', title: '`Code`' };
    expect(await createLinkForTab(tab)).toBe('[https://example.com Code]');
  });

  it('should handle empty title', async () => {
    const tab = { url: 'https://example.com', title: '' };
    expect(await createLinkForTab(tab)).toBe('[https://example.com ]');
  });

  it('should handle undefined title', async () => {
    const tab = { url: 'https://example.com' };
    expect(await createLinkForTab(tab)).toBe('[https://example.com ]');
  });

  it('should handle unicode characters', async () => {
    const tab = { url: 'https://example.com', title: '日本語 テスト 🎉' };
    expect(await createLinkForTab(tab)).toBe('[https://example.com 日本語 テスト 🎉]');
  });

  it('should handle very long titles', async () => {
    const longTitle = 'A'.repeat(1000);
    const tab = { url: 'https://example.com', title: longTitle };
    const result = await createLinkForTab(tab);
    expect(result).toContain(longTitle);
  });
});

describe('createLinksForTabs', () => {
  it('should create list with indentation', async () => {
    const tabs = [
      { url: 'https://one.com', title: 'One' },
      { url: 'https://two.com', title: 'Two' }
    ];
    const result = await createLinksForTabs(tabs);
    expect(result).toBe(' [https://one.com One]\n [https://two.com Two]');
  });

  it('should handle empty array', async () => {
    expect(await createLinksForTabs([])).toBe('');
  });

  it('should handle single tab', async () => {
    const tabs = [{ url: 'https://one.com', title: 'One' }];
    expect(await createLinksForTabs(tabs)).toBe(' [https://one.com One]');
  });
});
```

#### 2. Browser API Wrappers (`utils/tabs.ts`, `utils/history.ts`)

**Use WxtVitest mocks**

```javascript
// Example: utils/tabs.test.js
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { getCurrentTab, getSelectedTabs } from './tabs';

describe('tabs', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  describe('getCurrentTab', () => {
    it('should return active tab in current window', async () => {
      const mockTab = { id: 1, url: 'https://example.com', title: 'Test' };
      fakeBrowser.tabs.query.mockResolvedValue([mockTab]);

      const result = await getCurrentTab();

      expect(result).toEqual([mockTab]);
      expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true
      });
    });

    it('should return empty array when no active tab', async () => {
      fakeBrowser.tabs.query.mockResolvedValue([]);

      const result = await getCurrentTab();

      expect(result).toEqual([]);
    });
  });

  describe('getSelectedTabs', () => {
    it('should return highlighted tabs', async () => {
      const mockTabs = [
        { id: 1, url: 'https://one.com', title: 'One' },
        { id: 2, url: 'https://two.com', title: 'Two' }
      ];
      fakeBrowser.tabs.query.mockResolvedValue(mockTabs);

      const result = await getSelectedTabs();

      expect(result).toEqual(mockTabs);
      expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({
        highlighted: true,
        currentWindow: true
      });
    });
  });
});
```

#### 3. React Hooks (`entrypoints/sidepanel/hooks/*`)

**Use React Testing Library hooks utilities**

```javascript
// Example: entrypoints/sidepanel/hooks/useClipboardHistory.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { useClipboardHistory } from './useClipboardHistory';

describe('useClipboardHistory', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('should load initial history', async () => {
    const mockHistory = [
      { id: '1', text: 'test', timestamp: 1000 }
    ];
    fakeBrowser.storage.local.get.mockResolvedValue({
      clipboardHistory: mockHistory
    });

    const { result } = renderHook(() => useClipboardHistory());

    await waitFor(() => {
      expect(result.current).toEqual(mockHistory);
    });
  });

  it('should update when storage changes', async () => {
    fakeBrowser.storage.local.get.mockResolvedValue({ clipboardHistory: [] });

    const { result } = renderHook(() => useClipboardHistory());

    // Simulate storage change
    const newHistory = [{ id: '1', text: 'new', timestamp: 2000 }];
    await fakeBrowser.storage.local.set({ clipboardHistory: newHistory });

    await waitFor(() => {
      expect(result.current).toEqual(newHistory);
    });
  });

  it('should cleanup listener on unmount', async () => {
    fakeBrowser.storage.local.get.mockResolvedValue({ clipboardHistory: [] });

    const { unmount } = renderHook(() => useClipboardHistory());

    const removeListenerSpy = vi.spyOn(
      fakeBrowser.storage.onChanged,
      'removeListener'
    );

    unmount();

    expect(removeListenerSpy).toHaveBeenCalled();
  });
});
```

### Edge Cases to Test

For each function, test:

1. **Happy path** - Normal, expected input
2. **Empty input** - `''`, `[]`, `null`, `undefined`
3. **Boundary values** - Min/max lengths, limits
4. **Special characters** - Unicode, symbols, emojis
5. **Error conditions** - Network failures, missing permissions

### Test File Organization

- Place tests **next to source files**
- Same filename with `.test.js` or `.test.ts` extension

```
utils/
  ├── link.ts
  ├── link.test.js          ✅
  ├── tabs.ts
  ├── tabs.test.js          ✅
  ├── clipboard.ts
  ├── clipboard.test.ts     ❌ TODO
  ├── history.ts
  └── history.test.ts       ✅
```

---

## Component Testing Strategy

### Scope

Component tests verify **React components** in isolation, focusing on user interactions and state management.

### Priority Components

#### High Priority (Implement First)

1. **Popup Buttons** (`entrypoints/popup/components/*Button.tsx`)
   - User interactions (clicks)
   - Callback invocations
   - Loading states
   - Error handling

2. **Side Panel Components** (`entrypoints/sidepanel/components/*`)
   - History item rendering
   - Empty state display
   - Copy interactions

#### Medium Priority

3. **Popup App** (`entrypoints/popup/App.tsx`)
   - Message display
   - Component composition

4. **Side Panel App** (`entrypoints/sidepanel/App.tsx`)
   - History list rendering
   - Real-time updates

### Testing Approach

Use **React Testing Library** with user-centric queries.

#### Installation

```bash
npm install --save-dev @testing-library/react @testing-library/user-event jsdom
```

#### Configuration

Update `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    globals: true,
    environment: 'jsdom',  // Required for React Testing Library
    setupFiles: ['./vitest.setup.ts'],
  }
});
```

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { fakeBrowser } from 'wxt/testing/fake-browser';

beforeEach(() => {
  fakeBrowser.reset();
});
```

### Example Component Tests

#### Example 1: CopyCurrentTabButton.tsx

```typescript
// entrypoints/popup/components/CopyCurrentTabButton.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import CopyCurrentTabButton from './CopyCurrentTabButton';

describe('CopyCurrentTabButton', () => {
  const mockOnCopied = vi.fn();

  beforeEach(() => {
    fakeBrowser.reset();
    mockOnCopied.mockClear();

    // Mock i18n
    fakeBrowser.i18n.getMessage.mockImplementation((key) => {
      const messages = {
        'copyCurrentTab': 'Copy Current Tab',
        'copied': 'Copied!'
      };
      return messages[key] || key;
    });
  });

  it('should render button with correct text', () => {
    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    expect(screen.getByRole('button')).toHaveTextContent('Copy Current Tab');
  });

  it('should copy current tab link when clicked', async () => {
    const user = userEvent.setup();
    const mockTab = {
      id: 1,
      url: 'https://example.com',
      title: 'Example'
    };

    fakeBrowser.tabs.query.mockResolvedValue([mockTab]);

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '[https://example.com Example]'
      );
      expect(mockOnCopied).toHaveBeenCalledWith('Copied!');
    });
  });

  it('should handle error when no tab found', async () => {
    const user = userEvent.setup();
    fakeBrowser.tabs.query.mockResolvedValue([]);

    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockOnCopied).not.toHaveBeenCalled();
    });
  });

  it('should disable button while copying', async () => {
    const user = userEvent.setup();
    const mockTab = { url: 'https://example.com', title: 'Example' };

    fakeBrowser.tabs.query.mockResolvedValue([mockTab]);
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 100))
        )
      }
    });

    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Button should be disabled during async operation
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
```

#### Example 2: HistoryItem.tsx

```typescript
// entrypoints/sidepanel/components/HistoryItem.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryItem from './HistoryItem';

describe('HistoryItem', () => {
  const mockItem = {
    id: 'test-id',
    text: '[https://example.com Test Page]',
    timestamp: 1640000000000
  };

  it('should render history item text', () => {
    render(
      <HistoryItem
        item={mockItem}
        isCopied={false}
        onCopy={vi.fn()}
      />
    );

    expect(screen.getByText(mockItem.text)).toBeInTheDocument();
  });

  it('should show timestamp', () => {
    render(
      <HistoryItem
        item={mockItem}
        isCopied={false}
        onCopy={vi.fn()}
      />
    );

    // Should format timestamp (implementation-dependent)
    expect(screen.getByText(/ago|時間/)).toBeInTheDocument();
  });

  it('should call onCopy when clicked', async () => {
    const user = userEvent.setup();
    const mockOnCopy = vi.fn();

    render(
      <HistoryItem
        item={mockItem}
        isCopied={false}
        onCopy={mockOnCopy}
      />
    );

    await user.click(screen.getByRole('button'));

    expect(mockOnCopy).toHaveBeenCalledWith(mockItem);
  });

  it('should show "Copied!" indicator when isCopied is true', () => {
    render(
      <HistoryItem
        item={mockItem}
        isCopied={true}
        onCopy={vi.fn()}
      />
    );

    expect(screen.getByText(/copied/i)).toBeInTheDocument();
  });

  it('should truncate very long text', () => {
    const longItem = {
      ...mockItem,
      text: 'A'.repeat(500)
    };

    render(
      <HistoryItem
        item={longItem}
        isCopied={false}
        onCopy={vi.fn()}
      />
    );

    const displayedText = screen.getByText(/A+/).textContent;
    expect(displayedText.length).toBeLessThan(500);
  });
});
```

### Component Testing Best Practices

1. **Test User Behavior, Not Implementation**
   ```typescript
   // ❌ Bad - Testing implementation details
   expect(component.state.isLoading).toBe(true);

   // ✅ Good - Testing user-visible behavior
   expect(screen.getByRole('button')).toBeDisabled();
   ```

2. **Use Semantic Queries**
   - Prefer: `getByRole`, `getByLabelText`, `getByText`
   - Avoid: `getByTestId` (unless necessary)

3. **Test Accessibility**
   ```typescript
   it('should have accessible button', () => {
     render(<CopyButton onCopied={vi.fn()} />);
     expect(screen.getByRole('button')).toHaveAccessibleName('Copy');
   });
   ```

4. **Mock External Dependencies**
   - Browser APIs (tabs, storage, i18n)
   - Navigation (clipboard)
   - Utility functions (when testing in isolation)

---

## Integration Testing Strategy

### Scope

Integration tests verify **interactions between modules**, focusing on data flow and module coordination.

### What to Test

#### 1. Context Menu Handlers

Test the complete flow from menu click to clipboard write:

```typescript
// entrypoints/context_menu/handlers.test.ts
describe('Context Menu Handlers', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('should copy page link via context menu', async () => {
    const mockTab = {
      id: 1,
      url: 'https://example.com',
      title: 'Example'
    };

    // Mock script injection
    fakeBrowser.scripting.executeScript.mockResolvedValue([
      { result: undefined }
    ]);

    const handler = repository.getHandler('copy-for-scrapbox');
    await handler({ menuItemId: 'copy-for-scrapbox' }, mockTab);

    expect(fakeBrowser.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 1 },
      func: expect.any(Function),
      args: ['[https://example.com Example]']
    });
  });

  it('should copy selection as quotation', async () => {
    const mockTab = {
      id: 1,
      url: 'https://example.com',
      title: 'Example'
    };
    const mockInfo = {
      menuItemId: 'copy-selection-as-quotation',
      selectionText: 'Selected text here'
    };

    fakeBrowser.scripting.executeScript.mockResolvedValue([
      { result: undefined }
    ]);

    const handler = repository.getHandler('copy-selection-as-quotation');
    await handler(mockInfo, mockTab);

    expect(fakeBrowser.scripting.executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        args: [expect.stringContaining('> Selected text here')]
      })
    );
  });
});
```

#### 2. Clipboard + History Integration

Test that clipboard writes automatically add to history:

```typescript
// utils/clipboard.integration.test.ts
describe('Clipboard and History Integration', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('should add to history when writing to clipboard', async () => {
    const text = '[https://example.com Test]';

    await writeTextToClipboard(text);

    const history = await getHistory();

    expect(history).toHaveLength(1);
    expect(history[0].text).toBe(text);
  });

  it('should handle clipboard write failure gracefully', async () => {
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(
      new Error('Clipboard access denied')
    );

    await expect(
      writeTextToClipboard('test')
    ).rejects.toThrow('Clipboard access denied');

    // History should not be updated if clipboard write fails
    const history = await getHistory();
    expect(history).toHaveLength(0);
  });
});
```

#### 3. Storage Synchronization

Test side panel updates when storage changes:

```typescript
// entrypoints/sidepanel/App.integration.test.tsx
describe('Side Panel Storage Sync', () => {
  it('should update history when storage changes', async () => {
    fakeBrowser.storage.local.get.mockResolvedValue({
      clipboardHistory: []
    });

    render(<App />);

    // Initially empty
    expect(screen.getByText(/no history/i)).toBeInTheDocument();

    // Simulate storage update from popup
    const newHistory = [
      { id: '1', text: '[https://example.com Test]', timestamp: Date.now() }
    ];

    fakeBrowser.storage.local.get.mockResolvedValue({
      clipboardHistory: newHistory
    });

    // Trigger storage change event
    await fakeBrowser.storage.local.set({ clipboardHistory: newHistory });

    // Side panel should update
    await waitFor(() => {
      expect(screen.getByText(/example.com/)).toBeInTheDocument();
    });
  });
});
```

### Integration Test Organization

Place integration tests in a dedicated directory:

```
tests/
  └── integration/
      ├── context-menu.test.ts
      ├── clipboard-history.test.ts
      └── storage-sync.test.ts
```

Or next to the primary module:

```
entrypoints/
  └── context_menu/
      ├── index.ts
      ├── handler_repository.ts
      └── integration.test.ts
```

---

## End-to-End Testing Strategy

### Scope

E2E tests verify **complete user workflows** in a real browser environment. Given the limited scope, we focus on **key workflows only**.

### Target Workflows (Priority Order)

#### 1. Copy Current Tab from Popup (Critical)

```
1. User clicks extension icon
2. Popup opens
3. User clicks "Copy Current Tab" button
4. Link is copied to clipboard
5. Success message appears
6. Side panel shows history item
```

#### 2. Copy via Context Menu (Critical)

```
1. User right-clicks on page
2. Context menu shows "Copy for Scrapbox"
3. User clicks menu item
4. Link is copied to clipboard
5. Side panel shows history item
```

#### 3. Copy Multiple Tabs (Important)

```
1. User selects multiple tabs (Ctrl+Click)
2. User opens popup
3. User clicks "Copy Selected Tabs"
4. All tabs copied as list
5. Side panel shows history item
```

#### 4. Re-copy from History (Important)

```
1. User opens side panel
2. History items are displayed
3. User clicks a history item
4. Text is re-copied to clipboard
5. "Copied!" indicator appears
```

### E2E Testing Tools

**Recommended: Playwright** (officially supports Chrome extensions)

#### Installation

```bash
npm install --save-dev @playwright/test
```

#### Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,  // Extensions can't run in parallel
  timeout: 30000,
  use: {
    headless: false,  // Extensions don't work in headless Chrome
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome-extension',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
  ],
});
```

### Example E2E Tests

#### Test 1: Copy Current Tab

```typescript
// tests/e2e/copy-current-tab.spec.ts
import { test, expect, chromium } from '@playwright/test';
import path from 'path';

test.describe('Copy Current Tab', () => {
  test('should copy current tab link from popup', async () => {
    // Load extension
    const extensionPath = path.join(__dirname, '../../.output/chrome-mv3');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    const page = await context.newPage();

    // Navigate to test page
    await page.goto('https://example.com');

    // Click extension icon (get extension ID dynamically)
    const extensionId = await getExtensionId(context);
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);

    // Wait for popup to load
    await popupPage.waitForLoadState('domcontentloaded');

    // Click "Copy Current Tab" button
    await popupPage.click('button:has-text("Copy Current Tab")');

    // Verify success message
    await expect(popupPage.locator('text=Copied')).toBeVisible();

    // Verify clipboard content
    const clipboardText = await popupPage.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(clipboardText).toContain('[https://example.com');
    expect(clipboardText).toContain('Example Domain');

    await context.close();
  });
});

async function getExtensionId(context) {
  // Navigate to chrome://extensions and extract ID
  const page = await context.newPage();
  await page.goto('chrome://extensions');

  // Enable developer mode if needed
  await page.click('#devMode');

  // Get extension ID from the page
  const extensionId = await page.evaluate(() => {
    const extensions = document.querySelectorAll('extensions-item');
    for (const ext of extensions) {
      const name = ext.shadowRoot.querySelector('#name').textContent;
      if (name.includes('Copy for Scrapbox')) {
        return ext.getAttribute('id');
      }
    }
  });

  await page.close();
  return extensionId;
}
```

#### Test 2: Context Menu Copy

```typescript
// tests/e2e/context-menu.spec.ts
import { test, expect, chromium } from '@playwright/test';
import path from 'path';

test.describe('Context Menu', () => {
  test('should copy link via context menu', async () => {
    const extensionPath = path.join(__dirname, '../../.output/chrome-mv3');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    const page = await context.newPage();
    await page.goto('https://example.com');

    // Right-click to open context menu
    await page.click('body', { button: 'right' });

    // Wait for context menu (Chrome's native menu, hard to test directly)
    // Instead, test the handler was registered
    const extensionId = await getExtensionId(context);
    const backgroundPage = context.backgroundPages()[0];

    // Verify context menu handler exists
    const hasHandler = await backgroundPage.evaluate(() => {
      return new Promise((resolve) => {
        chrome.contextMenus.create({
          id: 'test-existence',
          title: 'Test'
        }, () => {
          chrome.contextMenus.remove('test-existence');
          resolve(true);
        });
      });
    });

    expect(hasHandler).toBe(true);

    await context.close();
  });
});
```

### E2E Test Best Practices

1. **Build Extension First**
   ```bash
   npm run build
   npm run test:e2e
   ```

2. **Use Page Object Pattern**
   ```typescript
   class ExtensionPopup {
     constructor(private page: Page) {}

     async clickCopyCurrentTab() {
       await this.page.click('button:has-text("Copy Current Tab")');
     }

     async getSuccessMessage() {
       return this.page.locator('text=Copied').textContent();
     }
   }
   ```

3. **Minimize E2E Tests**
   - Only test critical workflows
   - Cover most logic in unit/component tests
   - E2E tests are slow and flaky

4. **Handle Async Operations**
   ```typescript
   await page.waitForSelector('text=Copied', { timeout: 5000 });
   ```

5. **Clean State Between Tests**
   ```typescript
   test.beforeEach(async ({ context }) => {
     // Clear storage
     await context.clearCookies();
     await context.addInitScript(() => {
       chrome.storage.local.clear();
     });
   });
   ```

### E2E Test Organization

```
tests/
  └── e2e/
      ├── copy-current-tab.spec.ts
      ├── context-menu.spec.ts
      ├── copy-multiple-tabs.spec.ts
      ├── history-recopy.spec.ts
      └── helpers/
          ├── extension.ts
          └── clipboard.ts
```

---

## Testing Tools & Setup

### Current Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 4.0.16 | Test runner, assertion library |
| **WxtVitest** | Latest | Browser API mocking (fakeBrowser) |
| **TypeScript** | 5.9+ | Type checking in tests |

### Required Additions

#### 1. React Testing Library

```bash
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

**Purpose**: Component testing

**Configuration**: Update `vitest.config.ts` to use jsdom environment

#### 2. Playwright (Optional for E2E)

```bash
npm install --save-dev @playwright/test
```

**Purpose**: E2E testing

**Alternative**: Puppeteer, but Playwright has better extension support

### Configuration Files

#### vitest.config.ts (Updated)

```typescript
import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    globals: true,
    environment: 'jsdom',  // For React components
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['utils/**/*.ts', 'entrypoints/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/node_modules/**',
        '**/.output/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

#### vitest.setup.ts (New)

```typescript
import '@testing-library/jest-dom';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Reset fake browser before each test
beforeEach(() => {
  fakeBrowser.reset();
});

// Cleanup React components after each test
afterEach(() => {
  cleanup();
});

// Mock global browser APIs
global.browser = fakeBrowser as any;

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
});
```

#### playwright.config.ts (New)

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  timeout: 30000,
  retries: 2,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome-extension',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
  ],
});
```

### Package.json Scripts (Updated)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:coverage && npm run build && npm run test:e2e"
  }
}
```

---

## Test Organization & Naming Conventions

### File Structure

```
copy-for-scrapbox/
├── utils/
│   ├── link.ts
│   ├── link.test.js          # Unit tests next to source
│   ├── tabs.ts
│   ├── tabs.test.js
│   ├── clipboard.ts
│   ├── clipboard.test.ts     # TODO: Add
│   ├── history.ts
│   └── history.test.ts
├── entrypoints/
│   ├── popup/
│   │   ├── App.tsx
│   │   ├── App.test.tsx      # TODO: Add
│   │   └── components/
│   │       ├── CopyCurrentTabButton.tsx
│   │       ├── CopyCurrentTabButton.test.tsx  # TODO: Add
│   │       ├── CopySelectedTabsButton.tsx
│   │       ├── CopySelectedTabsButton.test.tsx
│   │       ├── CopyAllTabsButton.tsx
│   │       └── CopyAllTabsButton.test.tsx
│   ├── sidepanel/
│   │   ├── App.tsx
│   │   ├── App.test.tsx      # TODO: Add
│   │   ├── components/
│   │   │   ├── HistoryItem.tsx
│   │   │   ├── HistoryItem.test.tsx  # TODO: Add
│   │   │   ├── EmptyState.tsx
│   │   │   └── EmptyState.test.tsx   # TODO: Add
│   │   ├── hooks/
│   │   │   ├── useClipboardHistory.ts
│   │   │   ├── useClipboardHistory.test.ts  # TODO: Add
│   │   │   ├── useCopyToClipboard.ts
│   │   │   └── useCopyToClipboard.test.ts   # TODO: Add
│   │   └── utils/
│   │       ├── i18n.ts
│   │       ├── i18n.test.ts  # ✅ Exists
│   │       ├── formatTimestamp.ts
│   │       └── formatTimestamp.test.ts  # ✅ Exists
│   └── context_menu/
│       ├── index.ts
│       ├── handler_repository.ts
│       └── integration.test.ts  # TODO: Add
├── tests/
│   ├── integration/          # Integration tests
│   │   ├── clipboard-history.test.ts
│   │   ├── context-menu.test.ts
│   │   └── storage-sync.test.ts
│   └── e2e/                  # E2E tests
│       ├── copy-current-tab.spec.ts
│       ├── context-menu.spec.ts
│       ├── copy-multiple-tabs.spec.ts
│       └── helpers/
│           ├── extension.ts
│           └── page-objects.ts
├── vitest.config.ts
├── vitest.setup.ts
└── playwright.config.ts
```

### Naming Conventions

#### Test Files

- **Unit/Component tests**: `*.test.{js,ts,tsx}` (next to source)
- **Integration tests**: `*.test.{ts,tsx}` (in `tests/integration/`)
- **E2E tests**: `*.spec.ts` (in `tests/e2e/`)

#### Test Suites

```javascript
// Use describe() to group related tests
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should handle normal case', () => { });
    it('should handle edge case', () => { });
  });
});
```

#### Test Names

Follow the pattern: **"should [expected behavior] when [condition]"**

```javascript
// ✅ Good
it('should remove square brackets from title', () => { });
it('should return empty array when no tabs found', () => { });
it('should disable button while loading', () => { });

// ❌ Bad
it('test 1', () => { });
it('works', () => { });
it('removes brackets', () => { });  // Missing "should"
```

#### Test Structure (AAA Pattern)

```javascript
it('should do something', () => {
  // Arrange - Set up test data
  const input = 'test';
  const expected = 'result';

  // Act - Execute the function
  const result = functionUnderTest(input);

  // Assert - Verify the outcome
  expect(result).toBe(expected);
});
```

---

## Mocking Strategy

### When to Mock

1. **Browser APIs** - Always mock (tabs, storage, i18n, etc.)
2. **External services** - Not applicable (no external APIs)
3. **File system** - Not applicable
4. **Time/Dates** - Mock when testing time-sensitive logic
5. **Random values** - Mock `crypto.randomUUID()` for deterministic tests

### How to Mock

#### 1. Browser APIs (WxtVitest)

```javascript
import { fakeBrowser } from 'wxt/testing/fake-browser';

beforeEach(() => {
  fakeBrowser.reset();
});

// Mock tabs.query
fakeBrowser.tabs.query.mockResolvedValue([
  { id: 1, url: 'https://example.com', title: 'Test' }
]);

// Mock storage.local
fakeBrowser.storage.local.get.mockResolvedValue({ key: 'value' });
fakeBrowser.storage.local.set.mockResolvedValue(undefined);

// Mock i18n
fakeBrowser.i18n.getMessage.mockImplementation((key) => {
  const messages = { 'copySuccess': 'Copied!' };
  return messages[key] || key;
});
```

#### 2. Navigator APIs

```javascript
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  });
});
```

#### 3. crypto.randomUUID

```javascript
beforeEach(() => {
  let counter = 0;
  vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
    return `test-uuid-${counter++}`;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

#### 4. Date/Time

```javascript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

#### 5. Module Mocking

```javascript
// Mock entire module
vi.mock('@/utils/clipboard', () => ({
  writeTextToClipboard: vi.fn().mockResolvedValue(undefined),
}));

// Partial module mock
vi.mock('@/utils/link', async () => {
  const actual = await vi.importActual('@/utils/link');
  return {
    ...actual,
    createLinkForTab: vi.fn().mockResolvedValue('[https://test.com Test]'),
  };
});
```

### Mocking Best Practices

1. **Reset mocks between tests**
   ```javascript
   beforeEach(() => {
     vi.clearAllMocks();  // Clear call history
     fakeBrowser.reset();  // Reset WxtVitest state
   });
   ```

2. **Verify mock calls**
   ```javascript
   expect(mockFunction).toHaveBeenCalledTimes(1);
   expect(mockFunction).toHaveBeenCalledWith(expectedArg);
   ```

3. **Don't over-mock**
   - Only mock external dependencies
   - Test real code whenever possible
   - Prefer integration tests over heavily mocked unit tests

4. **Use type-safe mocks**
   ```typescript
   const mockTab: Browser.tabs.Tab = {
     id: 1,
     url: 'https://example.com',
     title: 'Test',
     // ... other required properties
   };
   ```

---

## CI/CD Integration

### Current CI Setup

The project uses GitHub Actions for CI:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

### Enhanced CI Configuration

Update `.github/workflows/ci.yml` to include coverage and E2E tests:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  # Unit and Component Tests
  test:
    name: Unit & Component Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true

      - name: Check coverage thresholds
        run: npm run test:coverage -- --coverage.thresholds.lines=80

  # Type Checking
  typecheck:
    name: TypeScript Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run compile

  # E2E Tests (Optional - only on main or release branches)
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Build extension
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Pre-commit Hooks (Optional)

Use Husky for pre-commit testing:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

`.husky/pre-commit`:
```bash
#!/bin/sh
npm test
npm run compile
```

Or use lint-staged for faster checks:

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "npm run compile",
      "npm test -- --run --bail"
    ]
  }
}
```

### Coverage Reporting

**Recommended: Codecov**

1. Sign up at https://codecov.io
2. Add repository
3. Coverage reports upload automatically in CI

**Alternative: Coveralls**

```bash
npm install --save-dev coveralls
```

```yaml
# In CI workflow
- run: npm run test:coverage
- name: Coveralls
  uses: coverallsapp/github-action@v2
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Status Badges

Add to README.md:

```markdown
[![CI](https://github.com/satoryu/copy-for-scrapbox/workflows/CI/badge.svg)](https://github.com/satoryu/copy-for-scrapbox/actions)
[![Coverage](https://codecov.io/gh/satoryu/copy-for-scrapbox/branch/main/graph/badge.svg)](https://codecov.io/gh/satoryu/copy-for-scrapbox)
```

---

## Test Maintenance

### Regular Maintenance Tasks

#### Weekly
- Review test coverage reports
- Fix flaky tests
- Update test data if needed

#### Monthly
- Review and remove obsolete tests
- Refactor duplicate test code
- Update testing documentation

#### Per Release
- Run full test suite (including E2E)
- Review coverage trends
- Update test fixtures for new data formats

### Identifying Flaky Tests

**Signs of flaky tests:**
- Passes/fails randomly
- Timing-dependent
- Order-dependent

**How to fix:**
```javascript
// ❌ Flaky - depends on timing
it('should update after delay', async () => {
  trigger();
  await new Promise(resolve => setTimeout(resolve, 100));
  expect(result).toBe('updated');
});

// ✅ Stable - waits for actual condition
it('should update after delay', async () => {
  trigger();
  await waitFor(() => expect(result).toBe('updated'));
});
```

### Refactoring Tests

**When tests become hard to maintain:**

1. **Extract test utilities**
   ```javascript
   // tests/helpers/test-utils.ts
   export function createMockTab(overrides = {}) {
     return {
       id: 1,
       url: 'https://example.com',
       title: 'Test',
       ...overrides
     };
   }

   export function setupMockBrowser() {
     fakeBrowser.reset();
     fakeBrowser.i18n.getMessage.mockImplementation(getMockMessage);
   }
   ```

2. **Use test fixtures**
   ```javascript
   // tests/fixtures/tabs.ts
   export const mockTabs = {
     simple: { id: 1, url: 'https://example.com', title: 'Example' },
     withBrackets: { id: 2, url: 'https://test.com', title: '[Test]' },
     withUnicode: { id: 3, url: 'https://jp.com', title: '日本語' },
   };
   ```

3. **Reduce duplication**
   ```javascript
   // Use parameterized tests
   it.each([
     ['simple', '[Title]', 'Title'],
     ['backticks', '`Code`', 'Code'],
     ['unicode', '日本語', '日本語'],
   ])('should handle %s titles', async (name, input, expected) => {
     const tab = { url: 'https://test.com', title: input };
     const result = await createLinkForTab(tab);
     expect(result).toContain(expected);
   });
   ```

### Test Documentation

Each complex test should have a comment explaining:

```javascript
it('should handle concurrent clipboard writes', async () => {
  // This test verifies that multiple rapid clipboard operations
  // don't cause race conditions in history storage.
  // We mock storage.local.get to return different values on each call
  // to simulate concurrent access.

  // ... test code
});
```

### Handling Test Failures

**When a test fails:**

1. **Don't ignore it** - Fix immediately or mark as skipped with reason
2. **Understand the failure** - Read error messages carefully
3. **Fix the code or the test** - Determine which is wrong
4. **Add more tests** - If edge case was missed

```javascript
// Temporarily skip with explanation
it.skip('should handle network timeout', () => {
  // TODO: Implement timeout handling in clipboard.ts
  // Blocked by: #123
});
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2) ✅ Complete Setup

**Goal**: Establish testing infrastructure

- [x] Vitest configured with WxtVitest
- [ ] React Testing Library installed
- [ ] jsdom environment configured
- [ ] vitest.setup.ts created
- [ ] Coverage reporting configured
- [ ] CI updated for coverage checks

**Deliverables**:
- `vitest.config.ts` updated
- `vitest.setup.ts` created
- CI workflow enhanced
- Documentation updated

---

### Phase 2: Unit Test Expansion (Week 3-4) 🎯 High Priority

**Goal**: Achieve 100% coverage for utils layer

**Tasks**:

1. **Complete utils/link.test.js**
   - [x] Basic link creation (exists)
   - [x] Bracket removal (exists)
   - [ ] Backtick removal
   - [ ] Unicode handling
   - [ ] Empty/undefined title
   - [ ] Very long titles
   - [ ] Special characters

2. **Create utils/clipboard.test.ts**
   - [ ] Successful clipboard write
   - [ ] History integration
   - [ ] Error handling
   - [ ] Permission denied scenario

3. **Expand utils/history.test.ts**
   - [x] Basic add/get (exists)
   - [ ] FIFO behavior with 100+ items
   - [ ] Concurrent writes
   - [ ] Storage quota errors

4. **Expand utils/tabs.test.js**
   - [ ] All query functions
   - [ ] Error handling
   - [ ] Empty results

**Acceptance Criteria**:
- All utils/ files have 100% coverage
- All edge cases documented in tests
- CI passes with no failures

---

### Phase 3: Component Tests (Week 5-7) 🎯 High Priority

**Goal**: Test all React components

**Priority Order**:

1. **Popup Buttons** (Week 5)
   - [ ] CopyCurrentTabButton.test.tsx
   - [ ] CopySelectedTabsButton.test.tsx
   - [ ] CopyAllTabsButton.test.tsx

   **Each should test**:
   - Rendering with correct text
   - Click behavior
   - Loading states
   - Error handling
   - Callback invocation

2. **Side Panel Components** (Week 6)
   - [ ] HistoryItem.test.tsx
   - [ ] EmptyState.test.tsx

   **Each should test**:
   - Rendering
   - User interactions
   - Props handling
   - Accessibility

3. **React Hooks** (Week 6)
   - [ ] useClipboardHistory.test.ts
   - [ ] useCopyToClipboard.test.ts

   **Each should test**:
   - Initial state
   - State updates
   - Side effects
   - Cleanup

4. **App Components** (Week 7)
   - [ ] popup/App.test.tsx
   - [ ] sidepanel/App.test.tsx

   **Each should test**:
   - Component composition
   - Message handling
   - State management

**Acceptance Criteria**:
- All components have 80%+ coverage
- User interactions tested with Testing Library
- Accessibility verified
- CI passes

---

### Phase 4: Integration Tests (Week 8-9) 🟡 Medium Priority

**Goal**: Test module interactions

**Tasks**:

1. **Context Menu Integration** (Week 8)
   - [ ] tests/integration/context-menu.test.ts
   - Test handler registration
   - Test script injection
   - Test clipboard write flow

2. **Clipboard + History** (Week 8)
   - [ ] tests/integration/clipboard-history.test.ts
   - Test automatic history recording
   - Test error scenarios

3. **Storage Synchronization** (Week 9)
   - [ ] tests/integration/storage-sync.test.ts
   - Test side panel updates
   - Test concurrent modifications

**Acceptance Criteria**:
- All critical integration paths covered
- Integration tests run in < 1 second
- CI includes integration tests

---

### Phase 5: E2E Tests (Week 10-12) 🟡 Medium Priority

**Goal**: Test key user workflows

**Tasks**:

1. **Setup Playwright** (Week 10)
   - [ ] Install Playwright
   - [ ] Configure playwright.config.ts
   - [ ] Create helper utilities
   - [ ] Create page object models

2. **Critical Workflows** (Week 11)
   - [ ] tests/e2e/copy-current-tab.spec.ts
   - [ ] tests/e2e/context-menu.spec.ts

3. **Additional Workflows** (Week 12)
   - [ ] tests/e2e/copy-multiple-tabs.spec.ts
   - [ ] tests/e2e/history-recopy.spec.ts

4. **CI Integration** (Week 12)
   - [ ] E2E tests run on main branch
   - [ ] Artifacts uploaded on failure

**Acceptance Criteria**:
- 4 E2E tests cover key workflows
- Tests run in < 30 seconds total
- E2E tests in CI (main branch only)

---

### Phase 6: Optimization & Refinement (Week 13-14) 🔵 Low Priority

**Goal**: Improve test suite quality

**Tasks**:

1. **Performance Optimization**
   - [ ] Identify slow tests
   - [ ] Optimize test setup/teardown
   - [ ] Parallelize where possible

2. **Test Refactoring**
   - [ ] Extract common test utilities
   - [ ] Create test fixtures
   - [ ] Reduce duplication

3. **Documentation**
   - [x] Update testing.md
   - [ ] Add examples to CLAUDE.md
   - [ ] Create test writing guide

4. **Coverage Analysis**
   - [ ] Review coverage reports
   - [ ] Add tests for uncovered branches
   - [ ] Document intentionally uncovered code

**Acceptance Criteria**:
- 80%+ overall coverage achieved
- Tests run in < 10 seconds (unit + component)
- Documentation complete

---

### Phase 7: Continuous Improvement (Ongoing)

**Goal**: Maintain and improve test quality

**Ongoing Tasks**:

- Review coverage weekly
- Fix flaky tests immediately
- Update tests when requirements change
- Add tests for new features (TDD)
- Refactor tests as needed

**Metrics to Track**:

| Metric | Current | Target |
|--------|---------|--------|
| Overall Coverage | ~60% | 80%+ |
| Utils Coverage | ~80% | 100% |
| Component Coverage | 0% | 80%+ |
| Integration Coverage | 0% | 70%+ |
| E2E Workflows | 0 | 4 |
| Test Execution Time | ~2s | <10s |
| CI Success Rate | ~95% | 98%+ |

---

## Summary

### Key Takeaways

1. **TDD is Mandatory** - Write tests before code
2. **80% Coverage Goal** - Focus on critical paths first
3. **Testing Pyramid** - 80% unit, 15% integration, 5% E2E
4. **Component Testing** - Use React Testing Library
5. **E2E Testing** - Playwright for key workflows only
6. **Chrome Only** - No cross-browser automated testing
7. **Fast Feedback** - Keep tests fast (< 10s for unit/component)

### Success Criteria

- [ ] 80%+ overall test coverage
- [ ] 100% coverage for utils/link.ts, utils/clipboard.ts, utils/history.ts
- [ ] All React components have tests
- [ ] 4 E2E tests for critical workflows
- [ ] CI runs tests on all PRs
- [ ] Coverage reports uploaded to Codecov
- [ ] Tests run in < 10 seconds (excluding E2E)
- [ ] Zero flaky tests

### Next Steps

1. **Review this strategy** with the team
2. **Set up React Testing Library** (Phase 1)
3. **Start with utils tests** (Phase 2)
4. **Implement component tests** (Phase 3)
5. **Add integration tests** (Phase 4)
6. **Set up E2E tests** (Phase 5)

---

**Document Version**: 1.0
**Last Updated**: 2026-01-12
**For Codebase Version**: 1.11.0
**Strategy Approved**: Pending review
