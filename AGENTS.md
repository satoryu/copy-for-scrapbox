# AGENTS.md - AI Development Guide

This document provides comprehensive guidance for AI agents working on the Copy for Scrapbox Chrome extension.

## Project Overview

**Copy for Scrapbox** is a Chrome extension that helps users of [Scrapbox](https://scrapbox.io/) create and copy links in Scrapbox's bracket notation format `[URL Title]`. The extension provides multiple ways to copy links via popup interface and context menus.

### Key Features
- Copy current tab as Scrapbox link
- Copy selected/all tabs as a list of links
- Right-click context menu for copying page links
- Copy selected text as quotation with page link
- Multi-language support (English, Japanese, Simplified Chinese, Traditional Chinese)

## Technology Stack

### Core Technologies
- **TypeScript** - Primary development language
- **React 19** - UI framework for popup interface
- **WXT 0.20.11** - Modern Chrome extension framework
- **Vitest 4** - Testing framework with WxtVitest plugin
- **Chrome Extension Manifest V3** - Extension platform

### Build Tools
- **WXT** - Handles building, bundling, manifest generation, and dev server
- **npm** - Package management
- **Node.js 20** - Runtime environment

## Architecture

### Project Structure

```
/home/user/copy-for-scrapbox/
├── entrypoints/              # Extension entry points (WXT convention)
│   ├── background.ts         # Service worker for context menus
│   ├── content.ts           # Content script (minimal usage)
│   ├── context_menu/        # Context menu handlers
│   │   ├── index.ts         # Menu registrations
│   │   └── handler_repository.ts  # Handler management
│   └── popup/               # Browser action popup
│       ├── main.tsx         # React entry point
│       ├── App.tsx          # Main popup component
│       └── components/      # React components
├── utils/                   # Utility modules
│   ├── clipboard.ts         # Clipboard operations
│   ├── link.ts             # Link formatting logic (CORE)
│   ├── tabs.ts             # Tab query helpers
│   ├── link.test.js        # Link tests
│   └── tabs.test.js        # Tab tests
├── public/                  # Static files
│   ├── _locales/           # i18n messages
│   └── icon/               # Extension icons
├── wxt.config.ts           # WXT configuration
├── tsconfig.json           # TypeScript config
└── vitest.config.ts        # Test configuration
```

### Key Entry Points
- `entrypoints/background.ts` - Service worker that sets up context menus
- `entrypoints/popup/main.tsx` - Popup UI entry point
- `entrypoints/content.ts` - Content script (currently minimal)

### Core Modules
- `utils/link.ts` - **CRITICAL**: Link formatting logic, sanitizes titles and creates `[URL Title]` format
- `utils/tabs.ts` - Tab query abstractions
- `utils/clipboard.ts` - Clipboard API wrapper using script injection
- `entrypoints/context_menu/handler_repository.ts` - Repository pattern for menu handlers

## Development Guidelines

### Coding Conventions

1. **TypeScript First**
   - Use TypeScript for all new code
   - Leverage WXT's generated types
   - Run `npm run compile` to check types before committing

2. **React Components**
   - Use functional components with hooks
   - Keep components small and focused
   - Use callback props for parent communication (e.g., `onCopied`)
   - Place popup components in `entrypoints/popup/components/`

3. **Async/Await**
   - Use async/await throughout
   - All browser API calls are Promise-based

4. **Internationalization**
   - Use `browser.i18n.getMessage()` for all user-facing text
   - Add messages to all 4 locales: `public/_locales/{en,ja,zh_CN,zh_TW}/messages.json`
   - Message keys use snake_case (e.g., `copy_current_tab`)

5. **Link Formatting Rules** (utils/link.ts)
   - Format: `[URL Title]`
   - Remove square brackets `[]` from titles (breaks Scrapbox syntax)
   - Remove backticks from titles
   - Keep sanitization logic centralized in `utils/link.ts`

### Best Practices

1. **WXT Conventions**
   - Entry points go in `entrypoints/` directory
   - Use `defineBackground()`, `defineContentScript()` from `wxt/sandbox`
   - Configuration in `wxt.config.ts`, not manual manifest.json

2. **Browser Compatibility**
   - Use `browser` API (WebExtension standard), not `chrome`
   - Separate build commands exist for Firefox
   - Test cross-browser compatibility

3. **Clipboard Operations**
   - Use `utils/clipboard.ts` wrapper
   - Script injection required for clipboard access from background
   - Handle permissions properly

4. **State Management**
   - React's useState/useEffect for popup UI
   - No external state management library needed
   - Keep state minimal and local

### Common Pitfalls to Avoid

1. **Don't** manually edit manifest.json (use wxt.config.ts instead)
2. **Don't** use `chrome` API directly (use `browser` for compatibility)
3. **Don't** forget to update all 4 locale files when adding UI text
4. **Don't** include square brackets in link titles (breaks Scrapbox)
5. **Don't** add unused dependencies (keep it minimal)

## Testing Strategy

### Running Tests
```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
```

### Test Coverage
- Unit tests for utility functions: `utils/*.test.js`
- Uses Vitest with browser API mocking
- Mock Chrome APIs using test helpers

### Writing Tests
- Place tests alongside source files (e.g., `link.test.js` next to `link.ts`)
- Mock browser APIs: `browser.tabs.query`, `browser.i18n.getMessage`
- Focus on utility logic and edge cases

### Areas Needing More Tests
- React components (currently no component tests)
- Integration tests for full workflows
- Context menu handlers

## Build and Development

### Development Commands
```bash
npm run dev              # Dev mode with hot reload (Chrome)
npm run dev:firefox      # Dev mode for Firefox
npm run build            # Production build (Chrome)
npm run build:firefox    # Production build for Firefox
npm run zip              # Create distributable ZIP (Chrome)
npm run zip:firefox      # Create distributable ZIP (Firefox)
npm run compile          # TypeScript type checking only
npm test                 # Run tests
```

### Development Workflow
1. Run `npm run dev` for hot-reload development
2. Load unpacked extension from `.output/chrome-mv3/`
3. Make changes (auto-reloads in browser)
4. Run tests: `npm test`
5. Type check: `npm run compile`
6. Commit changes with descriptive messages

### Build Output
- `.output/` - Build artifacts (gitignored)
- `.wxt/` - Generated config (gitignored)
- Distribution ZIPs created in project root

## Git and CI/CD

### Branch Strategy
- **Protected Branch**: `main`
- **Development**: Create feature branches
- **PR Required**: All changes via pull requests

### CI/CD Workflows

**On Pull Request** (`.github/workflows/ci.yml`):
- Runs tests on Node 20
- Must pass before merging

**On Tag Push** (`.github/workflows/release.yml`):
- Pattern: `v*.*.*`
- Runs tests
- Builds and packages extension
- Creates GitHub release with auto-generated notes
- Uploads extension ZIP as artifact

### Automated Dependencies
- Dependabot runs weekly for npm updates
- Auto-creates PRs for dependency updates

### Committing Changes

**Before Committing**:
1. Run `npm test` - Ensure tests pass
2. Run `npm run compile` - Check TypeScript
3. Test manually in browser
4. Update i18n if UI text changed

**Commit Message Format**:
- Clear, descriptive messages
- Reference issue numbers when applicable
- Follow conventional commits style preferred

## Common Development Tasks

### Adding a New Popup Button
1. Create component in `entrypoints/popup/components/`
2. Import and use in `entrypoints/popup/App.tsx`
3. Add i18n messages to all 4 locale files
4. Add click handler logic (usually calls `utils/clipboard.ts`)
5. Write tests if complex logic involved

### Adding a Context Menu Item
1. Add handler function in appropriate module
2. Register handler in `entrypoints/context_menu/handler_repository.ts`
3. Add menu item in `entrypoints/context_menu/index.ts`
4. Add i18n messages for menu text
5. Test right-click menu in browser

### Modifying Link Format
1. **IMPORTANT**: All changes go in `utils/link.ts`
2. Update tests in `utils/link.test.js`
3. Test with various URL/title combinations
4. Consider Scrapbox syntax constraints (no brackets, backticks)

### Adding a New Locale
1. Copy existing locale folder in `public/_locales/`
2. Translate all messages in `messages.json`
3. Test extension in that locale
4. Update documentation

### Debugging
1. **Popup**: Right-click extension icon → Inspect popup
2. **Background**: chrome://extensions → Inspect service worker
3. **Content Script**: Regular devtools on web page
4. Check console for errors
5. Use `console.log()` liberally during development

## Important Files to Know

### Configuration Files
- `wxt.config.ts` - Extension configuration and manifest settings
- `tsconfig.json` - TypeScript compiler options (extends WXT's config)
- `vitest.config.ts` - Test framework configuration
- `package.json` - Dependencies, scripts, metadata

### Core Source Files
- `utils/link.ts` - **MOST IMPORTANT**: Link formatting logic
- `utils/clipboard.ts` - Clipboard operations
- `utils/tabs.ts` - Tab querying
- `entrypoints/background.ts` - Service worker setup
- `entrypoints/popup/App.tsx` - Main UI component

### Documentation
- `README.md` - User-facing documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `CODE_OF_CONDUCT.md` - Community standards
- `docs/` - GitHub Pages documentation site

## Working with WXT

### What is WXT?
WXT is a modern framework for building Chrome extensions that:
- Auto-generates manifest.json from config
- Provides TypeScript types for APIs
- Includes dev server with hot reload
- Handles bundling and optimization
- Supports multiple browsers

### WXT-Specific Patterns
```typescript
// Background script
export default defineBackground(() => {
  // Service worker code
});

// Content script
export default defineContentScript({
  matches: ['*://google.com/*'],
  main() {
    // Content script code
  }
});
```

### WXT Configuration (wxt.config.ts)
```typescript
export default defineConfig({
  manifest: {
    // Manifest V3 settings
    permissions: ['tabs', 'contextMenus'],
    // ...
  }
});
```

## Security Considerations

1. **Permissions**: Only request necessary permissions
   - Current: `tabs`, `contextMenus`, `scripting`
2. **Content Security Policy**: Follow Manifest V3 CSP
3. **Script Injection**: Minimize use, only for clipboard access
4. **XSS Prevention**: Sanitize any user input (currently minimal)
5. **Dependencies**: Keep minimal, audit regularly

## Performance Considerations

1. **Minimal Dependencies**: Keep bundle size small
2. **Lazy Loading**: Consider for future features
3. **Tab Queries**: Use efficient filters in `browser.tabs.query()`
4. **Memory**: Service workers should be stateless

## Accessibility

- Use semantic HTML in popup
- Ensure keyboard navigation works
- Provide clear button labels
- Consider screen reader support

## Future Improvements to Consider

Based on codebase analysis, here are areas for enhancement:

1. **Testing**: Add component and integration tests
2. **Content Script**: Currently minimal, consider expanding features
3. **Cleanup**: Remove unused `components/counter.ts`
4. **Dependencies**: Remove unused `uuid` package
5. **Error Handling**: Add user-friendly error messages
6. **Options Page**: Consider adding settings/preferences

## Resources

### Documentation
- [WXT Documentation](https://wxt.dev/)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Scrapbox Help](https://scrapbox.io/help/)

### Project Links
- [GitHub Repository](https://github.com/satoryu/copy-for-scrapbox)
- [Issues](https://github.com/satoryu/copy-for-scrapbox/issues)

## Quick Reference

### Most Common Tasks
```bash
# Start development
npm run dev

# Run tests
npm test

# Type check
npm run compile

# Build for release
npm run build && npm run zip

# Format code (if formatter configured)
# Currently no formatter - follow existing style
```

### Key Browser APIs Used
- `browser.tabs` - Query and access tabs
- `browser.contextMenus` - Right-click menus
- `browser.scripting` - Execute clipboard script
- `browser.i18n` - Internationalization

### File Naming Conventions
- React components: PascalCase.tsx (e.g., `CopyCurrentTabButton.tsx`)
- Utilities: camelCase.ts (e.g., `clipboard.ts`)
- Tests: match source file with .test.js (e.g., `link.test.js`)
- Config files: lowercase with dots (e.g., `wxt.config.ts`)

---

## For AI Agents: Special Instructions

### When Making Changes

1. **Always read files first** before modifying
2. **Update all 4 locale files** if changing UI text
3. **Run tests** after utility changes
4. **Update tests** when changing tested code
5. **Check TypeScript** compilation before committing
6. **Keep changes minimal** - this is a focused, simple extension
7. **Preserve link formatting logic** - it's critical to Scrapbox compatibility

### Code Style
- Follow existing patterns in the codebase
- Use TypeScript strict mode
- Prefer async/await over promises
- Keep functions small and focused
- Add comments for complex logic only

### Testing Changes Manually
1. Run `npm run dev`
2. Open Chrome and go to `chrome://extensions`
3. Enable Developer mode
4. Load unpacked from `.output/chrome-mv3/`
5. Test all affected features
6. Check console for errors

### When Stuck
- Check WXT documentation first
- Look at existing similar code in the codebase
- Chrome extension docs for API questions
- Scrapbox help for link format questions

---

*This AGENTS.md file should be kept up-to-date as the project evolves.*
