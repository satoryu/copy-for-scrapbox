import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopyCurrentTabButton from './CopyCurrentTabButton';
import * as clipboard from '@/utils/clipboard';
import * as tabs from '@/utils/tabs';
import * as link from '@/utils/link';

// Mock the utility modules
vi.mock('@/utils/clipboard');
vi.mock('@/utils/tabs');
vi.mock('@/utils/link');

describe('CopyCurrentTabButton', () => {
  const mockOnCopied = vi.fn();
  const mockTab = { id: 1, url: 'https://example.com', title: 'Example' };
  const mockLink = '[https://example.com Example]';

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up i18n mock
    vi.spyOn(browser.i18n, 'getMessage').mockImplementation((key: string) => {
      const messages: Record<string, string> = {
        copyCurrentTabButtonName: 'Copy Current Tab',
        copyCurrentTabMessage: 'Copied current tab!',
      };
      return messages[key] || key;
    });

    // Set up successful mock implementations by default
    vi.mocked(tabs.getCurrentTab).mockResolvedValue([mockTab] as any);
    vi.mocked(link.createLinkForTab).mockReturnValue(mockLink);
    vi.mocked(clipboard.writeTextToClipboard).mockResolvedValue(undefined);
  });

  it('should render button with correct text from i18n', () => {
    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button', { name: 'Copy Current Tab' });
    expect(button).toBeInTheDocument();
  });

  it('should call getCurrentTab when clicked', async () => {
    const user = userEvent.setup();
    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(tabs.getCurrentTab).toHaveBeenCalledOnce();
  });

  it('should create link from tab data', async () => {
    const user = userEvent.setup();
    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Wait for async operations
    await vi.waitFor(() => {
      expect(link.createLinkForTab).toHaveBeenCalledWith(mockTab);
    });
  });

  it('should write link to clipboard', async () => {
    const user = userEvent.setup();
    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await vi.waitFor(() => {
      expect(clipboard.writeTextToClipboard).toHaveBeenCalledWith(mockLink);
    });
  });

  it('should call onCopied callback with success message', async () => {
    const user = userEvent.setup();
    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await vi.waitFor(() => {
      expect(mockOnCopied).toHaveBeenCalledWith('Copied current tab!');
    });
  });

  it('should handle errors by logging to console', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Failed to get tab');
    vi.mocked(tabs.getCurrentTab).mockRejectedValue(mockError);

    const user = userEvent.setup();
    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await vi.waitFor(() => {
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
    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
    });

    expect(mockOnCopied).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should not call onCopied if operation fails', async () => {
    vi.mocked(tabs.getCurrentTab).mockRejectedValue(new Error('Test error'));

    const user = userEvent.setup();
    render(<CopyCurrentTabButton onCopied={mockOnCopied} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Give time for promise to reject
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockOnCopied).not.toHaveBeenCalled();
  });
});
