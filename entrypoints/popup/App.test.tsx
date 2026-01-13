import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as clipboard from '@/utils/clipboard';
import * as tabs from '@/utils/tabs';
import * as link from '@/utils/link';

// Mock the utility modules
vi.mock('@/utils/clipboard');
vi.mock('@/utils/tabs');
vi.mock('@/utils/link');

describe('Popup App', () => {
  // Simplified mock data without full Browser.tabs.Tab type for test readability
  const mockCurrentTab = { id: 1, url: 'https://example.com', title: 'Example' };
  const mockSelectedTabs = [
    { id: 1, url: 'https://example.com', title: 'Example' },
    { id: 2, url: 'https://test.com', title: 'Test' },
  ];
  const mockAllTabs = [
    { id: 1, url: 'https://example.com', title: 'Example' },
    { id: 2, url: 'https://test.com', title: 'Test' },
    { id: 3, url: 'https://demo.com', title: 'Demo' },
  ];
  const mockLink = '[https://example.com Example]';
  const mockLinks = '[https://example.com Example]\n[https://test.com Test]';

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up i18n mock
    browser.i18n.getMessage = vi.fn((key: string) => {
      const messages: Record<string, string> = {
        copyCurrentTabButtonName: 'Copy Current Tab',
        copySelectedTabsButtonName: 'Copy Selected Tabs',
        copyAllTabsButtonName: 'Copy All Tabs',
        copyCurrentTabMessage: 'Copied current tab!',
        copySelectedTabsMessage: 'Copied selected tabs!',
        copyAllTabsMessage: 'Copied all tabs!',
      };
      return messages[key] || key;
    });

    // Set up successful mock implementations (using 'as any' for simplified mock Tab objects)
    vi.mocked(tabs.getCurrentTab).mockResolvedValue([mockCurrentTab] as any);
    vi.mocked(tabs.getSelectedTabs).mockResolvedValue(mockSelectedTabs as any);
    vi.mocked(tabs.getAllTabsOnCurrentWindow).mockResolvedValue(mockAllTabs as any);
    vi.mocked(link.createLinkForTab).mockResolvedValue(mockLink);
    vi.mocked(link.createLinksForTabs).mockResolvedValue(mockLinks);
    vi.mocked(clipboard.writeTextToClipboard).mockResolvedValue(undefined);
  });

  it('should render all three copy buttons', async () => {
    render(<App />);

    // Wait for async renders to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy Current Tab/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy Selected Tabs/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy All Tabs/ })).toBeInTheDocument();
    });
  });

  it('should render container with correct CSS class', async () => {
    const { container } = render(<App />);

    // Wait for async renders to complete
    await waitFor(() => {
      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toBeInTheDocument();
    });
  });

  it('should render message box', async () => {
    const { container } = render(<App />);

    // Wait for async renders to complete
    await waitFor(() => {
      const messageBox = container.querySelector('#message-box');
      expect(messageBox).toBeInTheDocument();
    });
  });

  it('should have empty message box initially', async () => {
    const { container } = render(<App />);

    // Wait for async renders to complete
    await waitFor(() => {
      const messageBox = container.querySelector('#message-box');
      expect(messageBox).toBeInTheDocument();
      expect(messageBox).toBeEmptyDOMElement();
    });
  });

  it('should render exactly three button components', async () => {
    render(<App />);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });
});
