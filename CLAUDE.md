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

> **📖 For detailed architecture documentation including module dependencies, data flows, and design decisions, see [docs/architecture.md](docs/architecture.md)**

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
├── docs/                    # Documentation
│   ├── architecture.md      # Module dependencies and design
│   └── development-guideline.md  # Development guidelines
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

> **📖 For comprehensive development guidelines including TDD workflow, coding standards, testing strategy, Git workflow, and common tasks, see [docs/development-guideline.md](docs/development-guideline.md)**

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

> **📖 For comprehensive testing strategy including coverage goals, test layers (unit/component/integration/E2E), tools, mocking strategy, and implementation roadmap, see [docs/testing.md](docs/testing.md)**

### Running Tests
```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # Run with coverage report
```

### Key Principles

- **Test-Driven Development (TDD)**: Always write tests BEFORE implementation
- **80%+ Coverage Goal**: Target 80% overall, 100% for critical paths
- **Test Location**: Place tests next to source files (e.g., `link.test.js` next to `link.ts`)
- **Browser API Mocking**: Use WxtVitest's `fakeBrowser` for all browser APIs
- **Fast Feedback**: Keep unit/component tests under 10 seconds total

### Current Test Coverage

- ✅ **Utils layer**: ~80% coverage (needs expansion to 100%)
- ❌ **Component layer**: Not implemented (needs React Testing Library)
- ❌ **Integration tests**: Not implemented
- ❌ **E2E tests**: Not implemented (4 key workflows planned)

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

**Test-Driven Development (TDD) workflow:**

1. **Write test first**
   - Create/update test file (e.g., `utils/myfeature.test.js`)
   - Write test describing desired behavior
   - Run `npm test` to see it fail (Red)

2. **Run development server** (optional, for UI work)
   - `npm run dev` for hot-reload development
   - Load unpacked extension from `.output/chrome-mv3/`

3. **Implement feature**
   - Write minimal code to pass the test
   - For utilities: edit files in `utils/`
   - For UI: edit files in `entrypoints/popup/`

4. **Run tests** to see them pass (Green)
   - `npm test` or `npm run test:watch`
   - All tests must pass

5. **Refactor** if needed
   - Clean up code while keeping tests green
   - Run tests after each change

6. **Type check**
   - `npm run compile`
   - Fix any TypeScript errors

7. **Manual testing** in browser
   - Test the feature works as expected
   - Check all affected functionality

8. **Commit changes** with descriptive messages
   - All tests passing
   - TypeScript compiling
   - Feature working in browser

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

**Follow TDD approach:**

1. **Write test first** (if logic is testable)
   - Create test file if testing component behavior
   - Or test the underlying utility function

2. **Create component** in `entrypoints/popup/components/`
   - Write minimal component to pass tests
   - Use React functional component with hooks

3. **Add i18n messages** to all 4 locale files
   - `public/_locales/{en,ja,zh_CN,zh_TW}/messages.json`
   - Use snake_case keys

4. **Import and use** in `entrypoints/popup/App.tsx`
   - Add component to UI
   - Wire up state and callbacks

5. **Add click handler logic**
   - Usually calls `utils/clipboard.ts`
   - If complex logic, extract to utility function with tests

6. **Run tests**: `npm test`

7. **Test manually in browser**
   - Load extension in `chrome://extensions`
   - Verify button works as expected

### Adding a Context Menu Item

**Follow TDD approach:**

1. **Write test for handler function first**
   - Test the handler logic in isolation
   - Mock browser APIs

2. **Implement handler function**
   - Add to appropriate module
   - Make tests pass

3. **Register handler** in `entrypoints/context_menu/handler_repository.ts`

4. **Add menu item** in `entrypoints/context_menu/index.ts`

5. **Add i18n messages** for menu text
   - Update all 4 locale files

6. **Run tests**: `npm test`

7. **Test right-click menu** in browser
   - Verify menu appears
   - Verify handler executes correctly

### Modifying Link Format

**CRITICAL: Always follow TDD for link formatting changes**

1. **Write failing test FIRST** in `utils/link.test.js`
   - Describe the desired behavior
   - Include edge cases
   - Run `npm test` to see it fail

2. **Implement change** in `utils/link.ts`
   - **IMPORTANT**: All changes go in `utils/link.ts`
   - Write minimal code to pass test
   - Consider Scrapbox syntax constraints (no brackets, backticks)

3. **Run tests**: `npm test` (should pass now)

4. **Test with various URL/title combinations**
   - Add more test cases if needed
   - Test special characters, unicode, etc.

5. **Refactor if needed**
   - Clean up code
   - Ensure tests still pass

**Example TDD workflow for link format change:**
```bash
# 1. Write test
vim utils/link.test.js  # Add test case

# 2. Run test (should fail)
npm test

# 3. Implement
vim utils/link.ts

# 4. Run test (should pass)
npm test

# 5. Manual verification
npm run dev  # Test in browser
```

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
- `CLAUDE.md` (this file) - AI agent development guide
- `docs/architecture.md` - **Module dependencies, data flows, and architectural design**
- `docs/development-guideline.md` - **Comprehensive development guidelines (TDD, coding standards, workflows)**
- `docs/testing.md` - **Testing strategy (coverage goals, test layers, tools, implementation roadmap)**

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

### Project Documentation
- **[Architecture Documentation](docs/architecture.md)** - Module dependencies, layered architecture, data flows, design decisions
- **[Development Guidelines](docs/development-guideline.md)** - TDD workflow, coding standards, testing, Git workflow, common tasks
- **[Testing Strategy](docs/testing.md)** - Testing goals, coverage targets, test layers (unit/component/integration/E2E), tools, implementation roadmap

### External Documentation
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

> **📖 Important Resources for AI Agents:**
> - **[docs/architecture.md](docs/architecture.md)** - Understand module dependencies before making changes
> - **[docs/development-guideline.md](docs/development-guideline.md)** - Follow detailed development workflow and best practices
> - **[docs/testing.md](docs/testing.md)** - Follow comprehensive testing strategy (coverage goals, test layers, tools)

### When Making Changes

**CRITICAL: This project follows Test-Driven Development (TDD). Always write tests BEFORE implementation.**

#### TDD Workflow for AI Agents

1. **FIRST: Write the test**
   - Before writing ANY production code, create a failing test
   - Describe the expected behavior in the test
   - Run `npm test` to verify the test fails (Red)
   - Example: If adding a new function to `utils/link.ts`, first add test cases to `utils/link.test.js`

2. **SECOND: Write minimal implementation**
   - Write just enough code to make the test pass
   - Don't add extra features or "nice-to-haves"
   - Run `npm test` to verify tests pass (Green)

3. **THIRD: Refactor if needed**
   - Improve code quality while keeping tests green
   - Run `npm test` after each change

4. **Always read files first** before modifying

5. **Update all 4 locale files** if changing UI text
   - `public/_locales/{en,ja,zh_CN,zh_TW}/messages.json`

6. **Run tests** after every change
   - Use `npm test` or `npm run test:watch`
   - All tests must pass before committing

7. **Update/add tests** when changing any code
   - If fixing a bug, write a test that reproduces it first
   - If adding a feature, write tests for all new code paths

8. **Check TypeScript** compilation before committing
   - Run `npm run compile`

9. **Keep changes minimal** - this is a focused, simple extension

10. **Preserve link formatting logic** - it's critical to Scrapbox compatibility

#### Mandatory TDD Examples for AI Agents

**Example 1: Adding a new utility function**
```bash
# ❌ WRONG: Don't do this
# Write utils/newfeature.ts first

# ✅ CORRECT: Do this
# 1. Write utils/newfeature.test.js first
# 2. Run npm test (should fail)
# 3. Write utils/newfeature.ts
# 4. Run npm test (should pass)
```

**Example 2: Fixing a bug**
```bash
# ❌ WRONG: Don't do this
# 1. Fix the bug in utils/link.ts
# 2. Run tests

# ✅ CORRECT: Do this
# 1. Add test case in utils/link.test.js that reproduces the bug (fails)
# 2. Run npm test to confirm test fails
# 3. Fix the bug in utils/link.ts
# 4. Run npm test to confirm test passes
```

**Example 3: Modifying existing functionality**
```bash
# ❌ WRONG: Don't do this
# 1. Modify utils/link.ts
# 2. Update utils/link.test.js

# ✅ CORRECT: Do this
# 1. Add/modify test in utils/link.test.js to reflect new behavior (fails)
# 2. Run npm test to confirm test fails
# 3. Modify utils/link.ts to implement new behavior
# 4. Run npm test to confirm test passes
```

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
