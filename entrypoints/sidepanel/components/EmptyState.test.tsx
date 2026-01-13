import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import * as i18nUtils from '../utils/i18n';

// Mock the i18n utility
vi.mock('../utils/i18n');

describe('EmptyState', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up i18n mock (support both overload signatures)
    vi.mocked(i18nUtils.getMessage).mockImplementation((...args: any[]) => {
      const messages: Record<string, string> = {
        sidepanelEmpty: 'No clipboard history yet',
      };
      const key = args[0] as string;
      const fallback = (args.length === 2 ? args[1] : args[2]) as string;
      return messages[key] || fallback;
    });
  });

  it('should render empty state message', () => {
    render(<EmptyState />);

    const message = screen.getByText('No clipboard history yet');
    expect(message).toBeInTheDocument();
  });

  it('should render with correct CSS class', () => {
    const { container } = render(<EmptyState />);

    const emptyStateDiv = container.querySelector('.empty-state');
    expect(emptyStateDiv).toBeInTheDocument();
  });

  it('should call getMessage with correct parameters', () => {
    render(<EmptyState />);

    expect(i18nUtils.getMessage).toHaveBeenCalledWith('sidepanelEmpty', 'No clipboard history yet');
  });

  it('should use fallback if i18n fails', () => {
    vi.mocked(i18nUtils.getMessage).mockReturnValue('No clipboard history yet');

    render(<EmptyState />);

    const message = screen.getByText('No clipboard history yet');
    expect(message).toBeInTheDocument();
  });
});
