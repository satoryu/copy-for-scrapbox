import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopyAllTabsButton from './CopyAllTabsButton';
import * as clipboard from '@/utils/clipboard';
import * as tabs from '@/utils/tabs';
import * as link from '@/utils/link';

// Mock the utility modules
vi.mock('@/utils/clipboard');
vi.mock('@/utils/tabs');
vi.mock('@/utils/link');

describe('CopyAllTabsButton', () => {
  const mockOnCopied = vi.fn();
  const mockTabs = [
    { id: 1, url: 'https://example.com', title: 'Example 1' },
    { id: 2, url: 'https://test.com', title: 'Test 2' },
    { id: 3, url: 'https://demo.com', title: 'Demo 3' },
  ];
  const mockLinks = '[https://example.com Example 1]\n[https://test.com Test 2]\n[https://demo.com Demo 3]';

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up i18n mock
    browser.i18n.getMessage = vi.fn((key: string) => {
      const messages: Record<string, string> = {
        copyAllTabsButtonName: 'Copy All Tabs',
        copyAllTabsMessage: 'Copied all tabs!',
      };
      return messages[key] || key;
    });

    // Set up successful mock implementations by default
    vi.mocked(tabs.getAllTabsOnCurrentWindow).mockResolvedValue(mockTabs as any);
    vi.mocked(link.createLinksForTabs).mockResolvedValue(mockLinks);
    vi.mocked(clipboard.writeTextToClipboard).mockResolvedValue(undefined);
  });

  it('should render button with correct text from i18n', () => {
    render(<CopyAllTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button', { name: 'Copy All Tabs' });
    expect(button).toBeInTheDocument();
  });

  it('should call getAllTabsOnCurrentWindow when clicked', async () => {
    const user = userEvent.setup();
    render(<CopyAllTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(tabs.getAllTabsOnCurrentWindow).toHaveBeenCalledOnce();
  });

  it('should create links from tab data', async () => {
    const user = userEvent.setup();
    render(<CopyAllTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(link.createLinksForTabs).toHaveBeenCalledWith(mockTabs);
    });
  });

  it('should write links to clipboard', async () => {
    const user = userEvent.setup();
    render(<CopyAllTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(clipboard.writeTextToClipboard).toHaveBeenCalledWith(mockLinks);
    });
  });

  it('should call onCopied callback with success message', async () => {
    const user = userEvent.setup();
    render(<CopyAllTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(mockOnCopied).toHaveBeenCalledWith('Copied all tabs!');
    });
  });

  it('should handle errors by logging to console', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Failed to get all tabs');
    vi.mocked(tabs.getAllTabsOnCurrentWindow).mockRejectedValue(mockError);

    const user = userEvent.setup();
    render(<CopyAllTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
    });

    expect(mockOnCopied).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should handle clipboard errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Clipboard write failed');
    vi.mocked(clipboard.writeTextToClipboard).mockRejectedValue(mockError);

    const user = userEvent.setup();
    render(<CopyAllTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
    });

    expect(mockOnCopied).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should not call onCopied if operation fails', async () => {
    vi.mocked(tabs.getAllTabsOnCurrentWindow).mockRejectedValue(new Error('Test error'));

    const user = userEvent.setup();
    render(<CopyAllTabsButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Give time for promise to reject
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockOnCopied).not.toHaveBeenCalled();
  });
});
