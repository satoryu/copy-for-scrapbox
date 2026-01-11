# Architecture Documentation

## Overview

Copy for Scrapbox is a Chrome extension built with modern web technologies, following Chrome Extension Manifest V3 specifications. The extension helps [Scrapbox](https://scrapbox.io/) users create and copy links in Scrapbox's bracket notation format `[URL Title]`.

## Technology Stack

### Core Technologies

- **TypeScript 5.9+** - Type-safe development
- **React 19** - UI framework for popup and side panel
- **WXT 0.20+** - Modern Chrome extension framework
- **Vitest 4** - Testing framework with WxtVitest plugin
- **Chrome Extension Manifest V3** - Latest extension platform

### Build & Development Tools

- **WXT** - Extension framework handling:
  - Build and bundling
  - Manifest generation
  - Development server with hot reload
  - Cross-browser support (Chrome, Firefox)
- **npm** - Package management
- **Node.js 20** - Runtime environment

## Project Structure

```
/home/user/copy-for-scrapbox/
├── entrypoints/              # Extension entry points (WXT convention)
│   ├── background.ts         # Service worker (context menu setup)
│   ├── content.ts           # Content script
│   ├── context_menu/        # Context menu module
│   │   ├── index.ts         # Menu item registrations and handlers
│   │   └── handler_repository.ts  # Repository pattern for handlers
│   ├── popup/               # Browser action popup UI
│   │   ├── main.tsx         # React entry point
│   │   ├── App.tsx          # Main popup component
│   │   └── components/      # React components
│   │       ├── CopyCurrentTabButton.tsx
│   │       ├── CopySelectedTabsButton.tsx
│   │       └── CopyAllTabsButton.tsx
│   └── sidepanel/           # Side panel UI (clipboard history)
│       ├── main.tsx         # React entry point
│       ├── App.tsx          # Main side panel component
│       ├── components/      # Side panel components
│       │   ├── EmptyState.tsx
│       │   └── HistoryItem.tsx
│       ├── hooks/           # Custom React hooks
│       │   ├── useClipboardHistory.ts
│       │   └── useCopyToClipboard.ts
│       └── utils/           # Side panel utilities
│           ├── formatTimestamp.ts
│           ├── formatTimestamp.test.ts
│           ├── i18n.ts
│           └── i18n.test.ts
├── utils/                   # Shared utility modules
│   ├── clipboard.ts         # Clipboard operations
│   ├── link.ts             # Link formatting (CORE LOGIC)
│   ├── link.test.js        # Link formatting tests
│   ├── tabs.ts             # Tab query helpers
│   ├── tabs.test.js        # Tab query tests
│   ├── history.ts          # Clipboard history storage
│   └── history.test.ts     # History tests
├── public/                  # Static assets
│   ├── _locales/           # i18n message files
│   │   ├── en/messages.json
│   │   ├── ja/messages.json
│   │   ├── zh_CN/messages.json
│   │   └── zh_TW/messages.json
│   └── icon/               # Extension icons
├── docs/                    # Documentation
├── wxt.config.ts           # WXT configuration
├── tsconfig.json           # TypeScript config
├── vitest.config.ts        # Test configuration
└── package.json            # Dependencies and scripts
```

## Architecture Components

### 1. Entry Points

The extension has four main entry points, following WXT conventions:

#### Background Script (`entrypoints/background.ts`)
- **Purpose**: Service worker that runs in the background
- **Responsibilities**:
  - Register context menu items on extension installation
  - Handle context menu click events
  - Delegate handling to context menu repository
- **Lifecycle**: Persistent service worker
- **Key Dependencies**: `context_menu/index.ts`

```typescript
// Entry point structure
export default defineBackground(() => {
  // Initialize context menus
  browser.runtime.onInstalled.addListener(...)

  // Handle menu clicks
  browser.contextMenus.onClicked.addListener(...)
})
```

#### Popup UI (`entrypoints/popup/`)
- **Purpose**: Browser action popup interface
- **Responsibilities**:
  - Provide buttons to copy current/selected/all tabs
  - Display feedback messages
  - Manage UI state
- **Technology**: React 19 with functional components and hooks
- **Entry File**: `main.tsx` → `App.tsx`

```typescript
// Component hierarchy
App.tsx
├── CopyCurrentTabButton
├── CopySelectedTabsButton
└── CopyAllTabsButton
```

#### Side Panel UI (`entrypoints/sidepanel/`)
- **Purpose**: Clipboard history viewer in Chrome's side panel
- **Responsibilities**:
  - Display clipboard history (up to 100 items)
  - Allow re-copying historical items
  - Show timestamps and formatted text
- **Technology**: React 19 with custom hooks
- **Storage**: Chrome storage API (local storage)

```typescript
// Component hierarchy
App.tsx
├── EmptyState (when no history)
└── HistoryItem[] (list of history items)

// Custom Hooks
useClipboardHistory()  // Manages history state
useCopyToClipboard()   // Handles copy operations
```

#### Content Script (`entrypoints/content.ts`)
- **Purpose**: Runs in web page context
- **Current Usage**: Minimal (placeholder for future features)
- **Potential Use Cases**: Injecting UI elements, page scraping

### 2. Core Modules (`utils/`)

These modules contain the business logic, independent of UI or extension APIs:

#### Link Formatting (`utils/link.ts`) ⭐ CRITICAL
- **Purpose**: Core link formatting logic for Scrapbox
- **Format**: `[URL Title]`
- **Sanitization Rules**:
  - Remove square brackets `[]` from titles (breaks Scrapbox syntax)
  - Remove backticks from titles
  - Preserve other characters
- **Functions**:
  - `createLinkForTab(tab)` - Create link for single tab
  - `createLinksForTabs(tabs)` - Create bulleted list for multiple tabs

```typescript
// Example output
"[https://example.com Example Page Title]"
" [https://example.com Tab 1]"
" [https://example.com Tab 2]"
```

#### Clipboard Operations (`utils/clipboard.ts`)
- **Purpose**: Wrapper for clipboard API
- **Function**: `writeTextToClipboard(text)`
- **Features**:
  - Write text to system clipboard
  - Automatically add to history
- **Implementation**: Uses `navigator.clipboard.writeText()` injected via content script

#### Tab Queries (`utils/tabs.ts`)
- **Purpose**: Helper functions for Chrome tabs API
- **Functions**:
  - Query current tab
  - Query selected tabs
  - Query all tabs in window
- **Abstraction**: Wraps `browser.tabs.query()` with common patterns

#### Clipboard History (`utils/history.ts`)
- **Purpose**: Manage clipboard history storage
- **Storage**: Chrome local storage API
- **Data Structure**:
  ```typescript
  interface ClipboardHistoryItem {
    id: string;        // UUID
    text: string;      // Copied text
    timestamp: number; // Unix timestamp
  }
  ```
- **Functions**:
  - `getHistory()` - Retrieve all history items
  - `addToHistory(text)` - Add new item to history
- **Limits**: Maximum 100 items (FIFO)

### 3. Context Menu System

The context menu system uses the **Repository Pattern** for extensibility:

#### Handler Repository (`entrypoints/context_menu/handler_repository.ts`)
- **Pattern**: Repository pattern
- **Purpose**: Centralized registry for context menu handlers
- **Structure**:
  ```typescript
  class HandlerRepository {
    registerHandler(handlerInfo)  // Add handler
    getHandler(menuId)             // Retrieve handler by ID
    getContextMenuInfo()           // Get menu metadata
  }
  ```

#### Registered Handlers (`entrypoints/context_menu/index.ts`)
1. **`copy-for-scrapbox`** - Copy page link
   - Context: Page (default)
   - Action: Create and copy Scrapbox link for current page

2. **`copy-selection-as-quotation`** - Copy selection as quote
   - Context: Selection (text must be selected)
   - Action: Format as `> [selected text]\n> [page link]`

3. **`open-clipboard-history`** - Open history panel
   - Context: Page
   - Action: Open side panel with clipboard history

### 4. UI Components

#### Popup Components (`entrypoints/popup/components/`)
All popup buttons follow a consistent pattern:
- **Props**: `{ onCopied: (message: string) => void }`
- **Behavior**:
  1. Query relevant tabs
  2. Create Scrapbox link(s)
  3. Write to clipboard
  4. Call `onCopied()` with success message
- **i18n**: All button text and messages use `browser.i18n.getMessage()`

#### Side Panel Components (`entrypoints/sidepanel/components/`)
- **EmptyState**: Shown when no history exists
- **HistoryItem**: Individual history item with:
  - Truncated text preview
  - Formatted timestamp
  - Copy button
  - Visual feedback when copied

## Data Flow

### Copy Current Tab Flow

```
User clicks popup button
  ↓
CopyCurrentTabButton.tsx
  ↓
tabs.ts: getCurrentTab()
  ↓
link.ts: createLinkForTab(tab)
  ↓
clipboard.ts: writeTextToClipboard(text)
  ↓
├─→ navigator.clipboard.writeText(text)
└─→ history.ts: addToHistory(text)
      ↓
    browser.storage.local.set()
  ↓
onCopied("Success message")
  ↓
App.tsx updates message display
```

### Context Menu Flow

```
User right-clicks page → selects menu item
  ↓
background.ts: contextMenus.onClicked
  ↓
handler_repository.ts: getHandler(menuId)
  ↓
Execute handler function
  ↓
link.ts: createLinkForTab(tab)
  ↓
browser.scripting.executeScript({
  func: writeTextToClipboard,
  args: [text]
})
  ↓
clipboard.ts: writeTextToClipboard() (in page context)
  ↓
├─→ navigator.clipboard.writeText(text)
└─→ history.ts: addToHistory(text)
```

### Clipboard History Flow

```
User opens side panel
  ↓
sidepanel/App.tsx
  ↓
useClipboardHistory() hook
  ↓
history.ts: getHistory()
  ↓
browser.storage.local.get('clipboardHistory')
  ↓
Render HistoryItem[] components
  ↓
User clicks "Copy" on history item
  ↓
useCopyToClipboard() hook
  ↓
clipboard.ts: writeTextToClipboard(text)
```

## Design Patterns

### 1. Repository Pattern
**Location**: `context_menu/handler_repository.ts`

**Purpose**: Centralize context menu handler registration and retrieval

**Benefits**:
- Single source of truth for menu items
- Easy to add new menu items
- Decouples handler registration from execution

### 2. React Component Pattern
**Location**: All `*.tsx` files

**Pattern**: Functional components with hooks
- `useState` for local state
- Custom hooks for reusable logic
- Props for parent-child communication

### 3. Utility Module Pattern
**Location**: `utils/` directory

**Purpose**: Pure business logic separated from UI and browser APIs
- Easily testable (no browser API mocking needed)
- Reusable across entry points
- Clear single responsibility

### 4. Script Injection Pattern
**Location**: `utils/clipboard.ts` used by context menu handlers

**Purpose**: Execute clipboard operations in page context
- Required because background scripts can't access clipboard directly
- Uses `browser.scripting.executeScript()` to inject function

## Extension Manifest Configuration

The extension uses **Manifest V3** with the following permissions:

### Permissions
- **`tabs`** - Query and access tab information
- **`contextMenus`** - Create right-click context menus
- **`scripting`** - Execute scripts for clipboard access
- **`storage`** - Store clipboard history locally
- **`sidePanel`** - Display clipboard history in side panel

### Host Permissions
- **`https://*/*`** - Required for script injection on HTTPS pages

### Web Accessible Resources
- **`src/*.js`** - Allows injected scripts to run

Configuration is managed in `wxt.config.ts`, not manually in `manifest.json`.

## Internationalization (i18n)

### Message Files
- **Location**: `public/_locales/{locale}/messages.json`
- **Supported Locales**: `en`, `ja`, `zh_CN`, `zh_TW`
- **Usage**: `browser.i18n.getMessage(key)`

### Message Format
```json
{
  "extensionName": {
    "message": "Copy for Scrapbox"
  },
  "contextMenuTitle": {
    "message": "Copy as Scrapbox link"
  }
}
```

### i18n Utility (`entrypoints/sidepanel/utils/i18n.ts`)
Provides fallback when messages are missing:
```typescript
getMessage(key: string, fallback: string): string
```

## Testing Architecture

### Test Framework
- **Vitest 4** - Unit testing framework
- **WxtVitest Plugin** - Provides browser API mocks

### Test Coverage
- ✅ `utils/link.test.js` - Link formatting logic
- ✅ `utils/tabs.test.js` - Tab query functions
- ✅ `utils/history.test.ts` - History storage
- ✅ `entrypoints/sidepanel/utils/formatTimestamp.test.ts` - Timestamp formatting
- ✅ `entrypoints/sidepanel/utils/i18n.test.ts` - i18n utility
- ❌ React components (no component tests currently)
- ❌ Integration tests

### Testing Strategy
- Unit tests for all utility functions
- Mock browser APIs (`browser.tabs`, `browser.i18n`, `browser.storage`)
- Tests placed alongside source files (`file.ts` → `file.test.ts`)

## Build Process

### Development
```bash
npm run dev              # Chrome dev mode with hot reload
npm run dev:firefox      # Firefox dev mode
```
- Output: `.output/chrome-mv3/` or `.output/firefox-mv3/`
- Features: Hot reload, source maps, dev mode

### Production
```bash
npm run build            # Production build for Chrome
npm run build:firefox    # Production build for Firefox
```
- Minification and optimization
- Manifest generation from `wxt.config.ts`

### Distribution
```bash
npm run zip              # Create .zip for Chrome Web Store
npm run zip:firefox      # Create .zip for Firefox Add-ons
```

### Type Checking
```bash
npm run compile          # TypeScript type check (no emit)
```

## Key Design Decisions

### 1. Why WXT Framework?
- Auto-generates manifest from TypeScript config
- Built-in dev server with hot reload
- TypeScript types for browser APIs
- Cross-browser support (Chrome, Firefox)
- Modern development experience

### 2. Why Repository Pattern for Context Menus?
- Extensibility: Easy to add new menu items
- Maintainability: Single place to register handlers
- Type safety: TypeScript ensures handler signatures match

### 3. Why Separate Utils from Entry Points?
- Testability: Pure functions are easier to test
- Reusability: Same logic used by popup and context menus
- Separation of concerns: Business logic separated from browser APIs

### 4. Why Side Panel for History?
- Better UX: Dedicated space for history browsing
- Native feel: Integrated with Chrome's UI
- Persistent: Can stay open while browsing

### 5. Why Local Storage for History?
- Persistence: Survives browser restarts
- Privacy: Data stays local, never synced
- Simplicity: No server or sync complexity

## Security Considerations

### Content Security Policy
- Manifest V3 enforces strict CSP
- No inline scripts allowed
- Remote code execution prohibited

### Permissions Minimization
- Only requests necessary permissions
- Host permissions limited to HTTPS

### Data Privacy
- All data stored locally
- No external network requests
- No telemetry or analytics

### Script Injection Safety
- Only injects trusted code (`writeTextToClipboard`)
- Runs in isolated context
- No user input directly injected

## Performance Considerations

### Bundle Size
- Minimal dependencies (React, WXT, Vitest only)
- No large libraries or frameworks
- Tree-shaking enabled in production builds

### Service Worker
- Stateless design (Manifest V3 requirement)
- Event-driven architecture
- Efficient message passing

### Storage Efficiency
- History limited to 100 items
- FIFO eviction policy
- No large data stored

### React Optimization
- Functional components (efficient)
- Minimal re-renders
- No complex state management needed

## Future Architecture Considerations

### Potential Improvements
1. **Component Testing** - Add Vitest component tests for React components
2. **Content Script Features** - Expand content script for page integration
3. **Options Page** - Add settings/preferences UI
4. **Storage Sync** - Optional sync across devices (requires `storage.sync` permission)
5. **Export/Import** - Allow history export/import
6. **Advanced Formatting** - Support custom link formats

### Scalability
- Current architecture supports up to ~10 context menu items
- Component structure allows easy addition of popup buttons
- Storage can handle larger history with pagination

### Maintainability
- Clear separation of concerns
- Well-documented code structure
- Comprehensive test coverage for utilities
- Type safety throughout

---

**Document Version**: 1.0
**Last Updated**: 2026-01-11
**Codebase Version**: 1.11.0
