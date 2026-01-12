# Testing Strategy

## Introduction

This document defines the testing strategy for the Copy for Scrapbox Chrome extension. The strategy aims to achieve high code quality through comprehensive test coverage while maintaining fast feedback loops and supporting Test-Driven Development practices.

### Project Context

- Chrome Extension (Manifest V3) built with WXT and React
- Testing Framework: Vitest 4 with WxtVitest plugin
- Target Browser: Chrome (Firefox not automatically tested)
- Current State: Solid unit test coverage for utilities; component testing needs implementation

---

## Testing Goals

1. **Achieve 80%+ overall test coverage** across the codebase
2. **Achieve 100% coverage for critical business logic** (link formatting, clipboard operations, history management)
3. **Prevent regressions** by requiring tests before bug fixes
4. **Enable confident refactoring** through comprehensive test coverage
5. **Maintain fast test execution** (< 10 seconds for unit and component tests)
6. **Support TDD workflow** with immediate feedback

---

## Test Coverage Strategy

### Distribution by Test Type

| Test Type | Percentage | Purpose |
|-----------|-----------|---------|
| **Unit Tests** | 80% | Verify individual functions and modules in isolation |
| **Integration Tests** | 15% | Verify interactions between modules |
| **E2E Tests** | 5% | Verify critical user workflows end-to-end |

### Coverage Targets by Layer

| Layer | Coverage Target | Priority |
|-------|----------------|----------|
| **Utils Layer** | 100% | Critical |
| **Component Layer** | 80%+ | High |
| **Integration Layer** | 70%+ | Medium |
| **E2E Coverage** | Key workflows only | Medium |

### Critical Paths Requiring 100% Coverage

- Link formatting logic
- Clipboard operations
- History management (add, retrieve, storage sync)
- Tab query operations

---

## Testing Layers

### Unit Testing

**Purpose**: Test individual functions and modules in isolation.

**Scope**:
- Pure utility functions
- Browser API wrappers
- React hooks
- i18n utilities

**Approach**:
- Place test files next to source files
- Mock browser APIs using WxtVitest
- Test all edge cases: empty inputs, boundary values, special characters, error conditions
- Maintain test independence

**Priority**: All utility modules must have comprehensive unit tests.

---

### Component Testing

**Purpose**: Test React components focusing on user interactions and rendering.

**Scope**:
- Popup buttons and UI components
- Side panel components
- App-level components

**Approach**:
- Use React Testing Library with jsdom environment
- Test user-visible behavior, not implementation details
- Mock browser APIs and external dependencies
- Verify accessibility and proper state management

**Priority**: All interactive components must be tested. Start with popup buttons (highest user interaction).

**Tools**: React Testing Library, @testing-library/user-event

---

### Integration Testing

**Purpose**: Verify interactions between modules and data flows.

**Scope**:
- Context menu handler registration and execution
- Clipboard operations triggering history updates
- Storage synchronization between popup and side panel
- Communication between background script and UI

**Approach**:
- Test complete workflows across module boundaries
- Verify data flows and state synchronization
- Use real implementations where possible; mock only external boundaries
- Focus on critical integration points

**Priority**: Test paths that involve multiple modules working together.

---

### End-to-End Testing

**Purpose**: Verify critical user workflows in a real browser environment.

**Scope** (Limited to key workflows):
1. Copy current tab link from popup
2. Copy page link via context menu
3. Copy multiple selected tabs
4. Re-copy from history in side panel

**Approach**:
- Use Playwright with Chrome/Chromium only
- Load built extension in real browser
- Test actual user interactions
- Keep tests minimal and focused
- Run only on main branch in CI (due to slow execution)

**Priority**: Medium. Cover only the most critical user paths.

**Tools**: Playwright

---

## Tools & Infrastructure

### Testing Stack

| Tool | Purpose | Status |
|------|---------|--------|
| **Vitest 4** | Test runner and assertion library | ✅ Installed |
| **WxtVitest** | Browser API mocking | ✅ Installed |
| **React Testing Library** | Component testing | ❌ Needs installation |
| **@testing-library/user-event** | User interaction simulation | ❌ Needs installation |
| **@testing-library/jest-dom** | DOM matchers | ❌ Needs installation |
| **jsdom** | DOM environment for component tests | ❌ Needs installation |
| **Playwright** | E2E testing (optional) | ❌ Needs installation |

### Required Setup

1. **Install component testing dependencies**:
   ```bash
   npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
   ```

2. **Update Vitest configuration** to use jsdom environment

3. **Create setup file** for test initialization

4. **Configure coverage thresholds** (80% minimum)

5. **Optional: Install Playwright** for E2E tests:
   ```bash
   npm install --save-dev @playwright/test
   ```

### Test Scripts

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run E2E tests (after Playwright setup)

---

## Mocking Strategy

### What to Mock

- **Browser APIs**: Always mock using WxtVitest's `fakeBrowser`
- **Navigator APIs**: Mock clipboard operations
- **Time/Dates**: Mock when testing time-sensitive behavior
- **Random values**: Mock UUID generation for deterministic tests

### What NOT to Mock

- Pure utility functions (test real implementations)
- React components in unit tests (unless testing in isolation)
- Module imports (prefer integration testing over heavy mocking)

---

## CI/CD Integration

### Current CI

- GitHub Actions runs tests on all pull requests
- Uses Node.js 20

### Enhanced CI Strategy

1. **Add coverage reporting**:
   - Upload coverage reports to Codecov or Coveralls
   - Fail CI if coverage drops below 80%

2. **Add type checking step**:
   - Run `npm run compile` to verify TypeScript

3. **Add E2E tests** (optional):
   - Run only on main branch or release tags
   - Upload test artifacts on failure

4. **Coverage badges**:
   - Add CI and coverage status badges to README

### Pre-commit Hooks (Optional)

Consider using Husky to run tests before commits, though this may slow down development workflow.

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Set up testing infrastructure

- [ ] Install React Testing Library and dependencies
- [ ] Configure jsdom environment in Vitest
- [ ] Create test setup file
- [ ] Configure coverage reporting
- [ ] Update CI workflow

**Outcome**: Ready to write component tests

---

### Phase 2: Unit Test Expansion (Weeks 3-4)
**Goal**: Achieve 100% coverage for utilities

- [ ] Expand existing utility tests to cover all edge cases
- [ ] Add tests for clipboard operations
- [ ] Add tests for history management edge cases
- [ ] Ensure all tab query functions are tested

**Outcome**: Complete utils layer testing

---

### Phase 3: Component Testing (Weeks 5-7) 🎯 **HIGH PRIORITY**
**Goal**: Test all React components

**Week 5**: Popup buttons
- [ ] Test all button components
- [ ] Test click handlers and callbacks
- [ ] Test loading and error states

**Week 6**: Side panel components
- [ ] Test history item rendering and interactions
- [ ] Test empty state
- [ ] Test React hooks

**Week 7**: App components
- [ ] Test popup App
- [ ] Test side panel App
- [ ] Test component composition

**Outcome**: 80%+ component coverage

---

### Phase 4: Integration Testing (Weeks 8-9)
**Goal**: Test module interactions

- [ ] Test context menu handler integration
- [ ] Test clipboard + history integration
- [ ] Test storage synchronization
- [ ] Test background + UI communication

**Outcome**: 70%+ integration coverage

---

### Phase 5: E2E Testing (Weeks 10-12)
**Goal**: Test critical user workflows

**Week 10**: Setup
- [ ] Install and configure Playwright
- [ ] Create helper utilities
- [ ] Build extension for testing

**Week 11-12**: Implement workflows
- [ ] Test: Copy current tab from popup
- [ ] Test: Copy via context menu
- [ ] Test: Copy multiple tabs
- [ ] Test: Re-copy from history

**Outcome**: 4 E2E tests covering critical paths

---

### Phase 6: Optimization (Weeks 13-14)
**Goal**: Improve test quality and performance

- [ ] Optimize slow tests
- [ ] Refactor duplicate test code
- [ ] Create test utilities and fixtures
- [ ] Review and achieve 80%+ overall coverage
- [ ] Document any intentionally uncovered code

**Outcome**: Optimized, maintainable test suite

---

### Phase 7: Continuous Maintenance (Ongoing)
**Goal**: Maintain test quality

- Monitor coverage trends
- Fix flaky tests immediately
- Update tests when requirements change
- Enforce TDD for all new features
- Review test suite monthly

---

## Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Overall Coverage | ~60% | 80%+ | 🔴 In Progress |
| Utils Coverage | ~80% | 100% | 🟡 Near Target |
| Component Coverage | 0% | 80%+ | 🔴 Not Started |
| Integration Coverage | 0% | 70%+ | 🔴 Not Started |
| E2E Test Count | 0 | 4 workflows | 🔴 Not Started |
| Test Execution Time | ~2s | <10s (unit+component) | 🟢 Good |
| CI Success Rate | ~95% | 98%+ | 🟢 Good |

---

## Next Steps

1. **Review and approve** this strategy
2. **Start Phase 1**: Install React Testing Library and configure testing environment
3. **Begin Phase 2**: Expand utility test coverage to 100%
4. **Prioritize Phase 3**: Implement component tests (highest value)
5. **Continue sequentially** through remaining phases

---

**Version**: 1.1
**Last Updated**: 2026-01-12
**Approved By**: Pending review
