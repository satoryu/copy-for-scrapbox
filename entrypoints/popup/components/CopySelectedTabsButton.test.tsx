import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopySelectedTabsButton from './CopySelectedTabsButton';
import * as clipboard from '@/utils/clipboard';
import * as tabs from '@/utils/tabs';
import * as link from '@/utils/link';

// Mock the utility modules
vi.mock('@/utils/clipboard');
vi.mock('@/utils/tabs');
vi.mock('@/utils/link');

describe('CopySelectedTabsButton', () => {
  const mockOnCopied = vi.fn();
  const mockTabs = [
    { id: 1, url: 'https://example.com', title: 'Example 1' },
    { id: 2, url: 'https://test.com', title: 'Test 2' },
  ];
  const mockLinks = '[https://example.com Example 1]\n[https://test.com Test 2]';

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up i18n mock
    vi.spyOn(browser.i18n, 'getMessage').mockImplementation((key: string) => {
      const messages: Record<string, string> = {
        copySelectedTabsButtonName: 'Copy Selected Tabs',
        copySelectedTabsMessage: 'Copied selected tabs!',
      };
      return messages[key] || key;
    });

    // Set up successful mock implementations by default
    vi.mocked(tabs.getSelectedTabs).mockResolvedValue(mockTabs as any);
    vi.mocked(link.createLinksForTabs).mockReturnValue(mockLinks);
    vi.mocked(clipboard.writeTextToClipboard).mockResolvedValue(undefined);
  });

  it('should render button with correct text from i18n', async () => {
    render(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    // Wait for useEffect to complete
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /Copy Selected Tabs/ });
      expect(button).toBeInTheDocument();
    });
  });

  it('should display selected tabs count on initial render', async () => {
    render(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    // Wait for useEffect to complete
    await waitFor(() => {
      const button = screen.getByRole('button', { name: 'Copy Selected Tabs (2)' });
      expect(button).toBeInTheDocument();
    });

    expect(tabs.getSelectedTabs).toHaveBeenCalledOnce();
  });

  it('should show count 0 initially before useEffect completes', () => {
    render(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button', { name: 'Copy Selected Tabs (0)' });
    expect(button).toBeInTheDocument();
  });

  it('should call getSelectedTabs when clicked', async () => {
    const user = userEvent.setup();
    render(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    // Wait for initial useEffect
    await waitFor(() => {
      expect(tabs.getSelectedTabs).toHaveBeenCalledTimes(1);
    });

    vi.clearAllMocks(); // Clear the useEffect call

    const button = screen.getByRole('button');
    await user.click(button);

    expect(tabs.getSelectedTabs).toHaveBeenCalledOnce();
  });

  it('should create links from tab data', async () => {
    const user = userEvent.setup();
    render(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(link.createLinksForTabs).toHaveBeenCalledWith(mockTabs);
    });
  });

  it('should write links to clipboard', async () => {
    const user = userEvent.setup();
    render(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(clipboard.writeTextToClipboard).toHaveBeenCalledWith(mockLinks);
    });
  });

  it('should call onCopied callback with success message', async () => {
    const user = userEvent.setup();
    render(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(mockOnCopied).toHaveBeenCalledWith('Copied selected tabs!');
    });
  });

  it('should handle errors by logging to console', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Failed to get selected tabs');
    vi.mocked(tabs.getSelectedTabs).mockRejectedValue(mockError);

    const user = userEvent.setup();
    render(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
    });

    expect(mockOnCopied).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should not call onCopied if operation fails', async () => {
    vi.mocked(tabs.getSelectedTabs).mockRejectedValue(new Error('Test error'));

    const user = userEvent.setup();
    render(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Give time for promise to reject
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockOnCopied).not.toHaveBeenCalled();
  });

  it('should update count when tabs change and component re-renders', async () => {
    const { rerender } = render(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    // Initial render with 2 tabs
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Selected Tabs (2)' })).toBeInTheDocument();
    });

    // Update mock to return different count
    const newMockTabs = [
      { id: 1, url: 'https://example.com', title: 'Example' },
      { id: 2, url: 'https://test.com', title: 'Test' },
      { id: 3, url: 'https://demo.com', title: 'Demo' },
    ];
    vi.mocked(tabs.getSelectedTabs).mockResolvedValue(newMockTabs as any);

    // Note: This test documents current behavior - the count doesn't update
    // automatically after initial load. This is by design (useEffect runs once).
    rerender(<CopySelectedTabsButton onCopied={mockOnCopied} />);

    // Count should still be 2 (from initial load)
    expect(screen.getByRole('button', { name: 'Copy Selected Tabs (2)' })).toBeInTheDocument();
  });
});
