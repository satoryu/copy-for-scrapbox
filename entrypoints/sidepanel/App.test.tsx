import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as i18nUtils from './utils/i18n';
import * as useClipboardHistoryHook from './hooks/useClipboardHistory';
import * as useCopyToClipboardHook from './hooks/useCopyToClipboard';
import type { ClipboardHistoryItem } from '../../utils/history';

// Mock the utilities and hooks
vi.mock('./utils/i18n');
vi.mock('./hooks/useClipboardHistory');
vi.mock('./hooks/useCopyToClipboard');

describe('Sidepanel App', () => {
  const mockHistoryItems: ClipboardHistoryItem[] = [
    {
      id: 'item-1',
      text: '[https://example.com Example]',
      timestamp: Date.now() - 60000, // 1 minute ago
    },
    {
      id: 'item-2',
      text: '[https://test.com Test]',
      timestamp: Date.now() - 120000, // 2 minutes ago
    },
  ];

  const mockCopyToClipboard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up i18n mock (support both overload signatures)
    vi.mocked(i18nUtils.getMessage).mockImplementation((...args: any[]) => {
      const messages: Record<string, string> = {
        sidepanelTitle: 'Clipboard History',
        sidepanelEmpty: 'No clipboard history yet',
        copiedFeedback: 'Copied!',
      };
      const key = args[0] as string;
      const fallback = (args.length === 2 ? args[1] : args[2]) as string;
      return messages[key] || fallback;
    });

    // Set up hooks mocks with default values
    vi.mocked(useClipboardHistoryHook.useClipboardHistory).mockReturnValue(mockHistoryItems);
    vi.mocked(useCopyToClipboardHook.useCopyToClipboard).mockReturnValue({
      copiedId: null,
      copyToClipboard: mockCopyToClipboard,
    });
  });

  it('should render sidepanel title', () => {
    render(<App />);

    const title = screen.getByText('Clipboard History');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('sidepanel-title');
  });

  it('should render container with correct CSS class', () => {
    const { container } = render(<App />);

    const containerDiv = container.querySelector('.sidepanel-container');
    expect(containerDiv).toBeInTheDocument();
  });

  it('should render history items when history exists', () => {
    render(<App />);

    expect(screen.getByText('[https://example.com Example]')).toBeInTheDocument();
    expect(screen.getByText('[https://test.com Test]')).toBeInTheDocument();
  });

  it('should render history list with correct CSS class', () => {
    const { container } = render(<App />);

    const historyList = container.querySelector('.history-list');
    expect(historyList).toBeInTheDocument();
  });

  it('should render EmptyState when history is empty', () => {
    vi.mocked(useClipboardHistoryHook.useClipboardHistory).mockReturnValue([]);

    render(<App />);

    expect(screen.getByText('No clipboard history yet')).toBeInTheDocument();
  });

  it('should not render history list when history is empty', () => {
    vi.mocked(useClipboardHistoryHook.useClipboardHistory).mockReturnValue([]);

    const { container } = render(<App />);

    const historyList = container.querySelector('.history-list');
    expect(historyList).not.toBeInTheDocument();
  });

  it('should call copyToClipboard when history item is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstItem = screen.getByText('[https://example.com Example]').closest('.history-item');
    expect(firstItem).toBeInTheDocument();

    await user.click(firstItem!);

    expect(mockCopyToClipboard).toHaveBeenCalledOnce();
    expect(mockCopyToClipboard).toHaveBeenCalledWith('item-1', '[https://example.com Example]');
  });

  it('should pass copiedId to HistoryItem components', () => {
    vi.mocked(useCopyToClipboardHook.useCopyToClipboard).mockReturnValue({
      copiedId: 'item-1',
      copyToClipboard: mockCopyToClipboard,
    });

    const { container } = render(<App />);

    const copiedItem = container.querySelector('.history-item.copied');
    expect(copiedItem).toBeInTheDocument();
  });

  it('should render all history items', () => {
    render(<App />);

    const historyItems = screen.getAllByText(/\[https:\/\//);
    expect(historyItems).toHaveLength(2);
  });

  it('should handle multiple history items correctly', () => {
    const manyItems: ClipboardHistoryItem[] = [
      { id: '1', text: 'Item 1', timestamp: Date.now() - 1000 },
      { id: '2', text: 'Item 2', timestamp: Date.now() - 2000 },
      { id: '3', text: 'Item 3', timestamp: Date.now() - 3000 },
      { id: '4', text: 'Item 4', timestamp: Date.now() - 4000 },
    ];

    vi.mocked(useClipboardHistoryHook.useClipboardHistory).mockReturnValue(manyItems);

    render(<App />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByText('Item 4')).toBeInTheDocument();
  });

  it('should use unique keys for history items', () => {
    const { container } = render(<App />);

    const historyItems = container.querySelectorAll('.history-item');
    expect(historyItems).toHaveLength(2);

    // React automatically handles unique keys, we just verify all items are rendered
    expect(historyItems[0]).toHaveTextContent('[https://example.com Example]');
    expect(historyItems[1]).toHaveTextContent('[https://test.com Test]');
  });

  it('should call handleCopy with correct item when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const secondItem = screen.getByText('[https://test.com Test]').closest('.history-item');
    await user.click(secondItem!);

    expect(mockCopyToClipboard).toHaveBeenCalledWith('item-2', '[https://test.com Test]');
  });

  it('should call getMessage for title with correct parameters', () => {
    render(<App />);

    expect(i18nUtils.getMessage).toHaveBeenCalledWith('sidepanelTitle', 'Clipboard History');
  });
});
