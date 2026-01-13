import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryItem } from './HistoryItem';
import type { ClipboardHistoryItem } from '../../../utils/history';
import * as formatTimestampUtils from '../utils/formatTimestamp';
import * as i18nUtils from '../utils/i18n';

// Mock the utilities
vi.mock('../utils/formatTimestamp');
vi.mock('../utils/i18n');

describe('HistoryItem', () => {
  const mockItem: ClipboardHistoryItem = {
    id: 'test-id-123',
    text: '[https://example.com Example Page]',
    timestamp: 1234567890000,
  };

  const mockOnCopy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up formatTimestamp mock
    vi.mocked(formatTimestampUtils.formatTimestamp).mockReturnValue('2 minutes ago');

    // Set up i18n mock (support both overload signatures)
    vi.mocked(i18nUtils.getMessage).mockImplementation((...args: any[]) => {
      const messages: Record<string, string> = {
        copiedFeedback: 'Copied!',
      };
      const key = args[0] as string;
      const fallback = (args.length === 2 ? args[1] : args[2]) as string;
      return messages[key] || fallback;
    });
  });

  it('should render history item text', () => {
    render(<HistoryItem item={mockItem} isCopied={false} onCopy={mockOnCopy} />);

    const text = screen.getByText('[https://example.com Example Page]');
    expect(text).toBeInTheDocument();
  });

  it('should render formatted timestamp', () => {
    render(<HistoryItem item={mockItem} isCopied={false} onCopy={mockOnCopy} />);

    const timestamp = screen.getByText('2 minutes ago');
    expect(timestamp).toBeInTheDocument();
    expect(formatTimestampUtils.formatTimestamp).toHaveBeenCalledWith(1234567890000);
  });

  it('should not show copied feedback when isCopied is false', () => {
    render(<HistoryItem item={mockItem} isCopied={false} onCopy={mockOnCopy} />);

    const feedback = screen.queryByText('Copied!');
    expect(feedback).not.toBeInTheDocument();
  });

  it('should show copied feedback when isCopied is true', () => {
    render(<HistoryItem item={mockItem} isCopied={true} onCopy={mockOnCopy} />);

    const feedback = screen.getByText('Copied!');
    expect(feedback).toBeInTheDocument();
  });

  it('should apply copied CSS class when isCopied is true', () => {
    const { container } = render(<HistoryItem item={mockItem} isCopied={true} onCopy={mockOnCopy} />);

    const historyItemDiv = container.querySelector('.history-item.copied');
    expect(historyItemDiv).toBeInTheDocument();
  });

  it('should not apply copied CSS class when isCopied is false', () => {
    const { container } = render(<HistoryItem item={mockItem} isCopied={false} onCopy={mockOnCopy} />);

    const historyItemDiv = container.querySelector('.history-item');
    expect(historyItemDiv).toBeInTheDocument();
    expect(historyItemDiv).not.toHaveClass('copied');
  });

  it('should call onCopy with item when clicked', async () => {
    const user = userEvent.setup();
    render(<HistoryItem item={mockItem} isCopied={false} onCopy={mockOnCopy} />);

    const historyItem = screen.getByText('[https://example.com Example Page]').closest('.history-item');
    expect(historyItem).toBeInTheDocument();

    await user.click(historyItem!);

    expect(mockOnCopy).toHaveBeenCalledOnce();
    expect(mockOnCopy).toHaveBeenCalledWith(mockItem);
  });

  it('should handle multiple clicks', async () => {
    const user = userEvent.setup();
    render(<HistoryItem item={mockItem} isCopied={false} onCopy={mockOnCopy} />);

    const historyItem = screen.getByText('[https://example.com Example Page]').closest('.history-item');

    await user.click(historyItem!);
    await user.click(historyItem!);
    await user.click(historyItem!);

    expect(mockOnCopy).toHaveBeenCalledTimes(3);
    expect(mockOnCopy).toHaveBeenCalledWith(mockItem);
  });

  it('should render with correct CSS classes', () => {
    const { container } = render(<HistoryItem item={mockItem} isCopied={false} onCopy={mockOnCopy} />);

    expect(container.querySelector('.history-item')).toBeInTheDocument();
    expect(container.querySelector('.history-text')).toBeInTheDocument();
    expect(container.querySelector('.history-timestamp')).toBeInTheDocument();
  });

  it('should render copied feedback with correct CSS class', () => {
    const { container } = render(<HistoryItem item={mockItem} isCopied={true} onCopy={mockOnCopy} />);

    const copiedFeedback = container.querySelector('.copied-feedback');
    expect(copiedFeedback).toBeInTheDocument();
    expect(copiedFeedback).toHaveTextContent('Copied!');
  });

  it('should handle long text content', () => {
    const longTextItem: ClipboardHistoryItem = {
      ...mockItem,
      text: '[https://example.com/very/long/url/path This is a very long title that might need truncation in the UI]',
    };

    render(<HistoryItem item={longTextItem} isCopied={false} onCopy={mockOnCopy} />);

    const text = screen.getByText(/This is a very long title/);
    expect(text).toBeInTheDocument();
  });

  it('should handle special characters in text', () => {
    const specialTextItem: ClipboardHistoryItem = {
      ...mockItem,
      text: '[https://example.com Test & Demo < > " \' ]',
    };

    render(<HistoryItem item={specialTextItem} isCopied={false} onCopy={mockOnCopy} />);

    const text = screen.getByText('[https://example.com Test & Demo < > " \' ]');
    expect(text).toBeInTheDocument();
  });
});
