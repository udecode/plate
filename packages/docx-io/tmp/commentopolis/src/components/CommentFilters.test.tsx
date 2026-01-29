import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { CommentFilters } from './CommentFilters';
import { CommentFilterProvider } from '../contexts/CommentFilterContext';
import type { DocumentComment } from '../types';

// Mock the useDocumentContext hook
const mockUseDocumentContext = vi.fn();
vi.mock('../hooks/useDocumentContext', () => ({
  useDocumentContext: () => mockUseDocumentContext(),
}));

// Test wrapper component that provides the CommentFilterProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <CommentFilterProvider>
    {children}
  </CommentFilterProvider>
);

describe('CommentFilters', () => {
  const mockComments: DocumentComment[] = [
    {
      id: 'comment1',
      author: 'John Doe',
      date: new Date('2023-01-01T10:00:00Z'),
      plainText: 'Test comment #budget',
      content: '<p>Test comment #budget</p>',
      documentId: 'doc1',
    },
    {
      id: 'comment2',
      author: 'Jane Smith',
      date: new Date('2023-01-02T11:00:00Z'),
      plainText: 'Another comment #timeline',
      content: '<p>Another comment #timeline</p>',
      documentId: 'doc1',
    },
  ];

  beforeEach(() => {
    mockUseDocumentContext.mockReturnValue({
      comments: mockComments,
    });
  });

  it('should render comment filters when comments are available', () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    expect(screen.getByText('Comment Filters')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Search Comments')).toBeInTheDocument();
  });

  it('should not render when no comments are available', () => {
    mockUseDocumentContext.mockReturnValue({
      comments: [],
    });

    const { container } = render(<CommentFilters />, { wrapper: TestWrapper });
    expect(container.firstChild).toBeNull();
  });

  it('should populate author dropdown with unique authors', () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    expect(screen.getByRole('option', { name: 'All authors' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Jane Smith' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'John Doe' })).toBeInTheDocument();
  });

  it('should show reset button when filters are active', async () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    const selects = screen.getAllByRole('combobox');
    const authorSelect = selects[0]; // First select is author
    fireEvent.change(authorSelect, { target: { value: 'John Doe' } });

    await waitFor(() => {
      expect(screen.getByText('Reset all')).toBeInTheDocument();
    });
  });

  it('should show active filters status', async () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    const selects = screen.getAllByRole('combobox');
    const authorSelect = selects[0]; // First select is author
    fireEvent.change(authorSelect, { target: { value: 'John Doe' } });

    await waitFor(() => {
      expect(screen.getByText(/Active filters: Author: John Doe/)).toBeInTheDocument();
    });
  });

  it('should handle search input with debouncing', async () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    const searchInput = screen.getByPlaceholderText('Search in comments, authors, references...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // Initially should not show in active filters (debouncing)
    expect(screen.queryByText(/Search: "test search"/)).not.toBeInTheDocument();

    // After debounce delay, should show in active filters
    await waitFor(() => {
      expect(screen.getByText(/Search: "test search"/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should reset filters when reset button is clicked', async () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    // Set some filters
    const selects = screen.getAllByRole('combobox');
    const authorSelect = selects[0]; // First select is author
    fireEvent.change(authorSelect, { target: { value: 'John Doe' } });

    const searchInput = screen.getByPlaceholderText('Search in comments, authors, references...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Reset all')).toBeInTheDocument();
    });

    // Click reset
    const resetButton = screen.getByText('Reset all');
    fireEvent.click(resetButton);

    // Check that filters are reset
    await waitFor(() => {
      expect(screen.queryByText('Reset all')).not.toBeInTheDocument();
      expect(screen.queryByText(/Active filters:/)).not.toBeInTheDocument();
    });

    expect(authorSelect).toHaveValue('');
    expect(searchInput).toHaveValue('');
  });

  it('should handle date range inputs', () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    const startDateInput = screen.getByPlaceholderText('Start date');
    const endDateInput = screen.getByPlaceholderText('End date');

    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-01-31' } });

    expect(startDateInput).toHaveValue('2023-01-01');
    expect(endDateInput).toHaveValue('2023-01-31');
  });

  it('should show hashtag filter when comments have hashtags', () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    expect(screen.getByText('Hashtags')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /#budget/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /#timeline/ })).toBeInTheDocument();
  });

  it('should not show hashtag filter when no hashtags are present', () => {
    const commentsWithoutHashtags: DocumentComment[] = [
      {
        id: 'comment1',
        author: 'John Doe',
        date: new Date('2023-01-01T10:00:00Z'),
        plainText: 'Test comment without hashtag',
        content: '<p>Test comment without hashtag</p>',
        documentId: 'doc1',
      },
    ];

    mockUseDocumentContext.mockReturnValue({
      comments: commentsWithoutHashtags,
    });

    render(<CommentFilters />, { wrapper: TestWrapper });

    expect(screen.queryByText('Hashtags')).not.toBeInTheDocument();
  });

  it('should allow selecting multiple hashtags', async () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    // Find and click the hashtag checkboxes
    const budgetCheckbox = screen.getByRole('checkbox', { name: /#budget/ });
    const timelineCheckbox = screen.getByRole('checkbox', { name: /#timeline/ });
    
    fireEvent.click(budgetCheckbox);
    fireEvent.click(timelineCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/Hashtags: #budget, #timeline/)).toBeInTheDocument();
    });
  });

  it('should show selected hashtags in active filters status', async () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    // Find and click a hashtag checkbox
    const budgetCheckbox = screen.getByRole('checkbox', { name: /#budget/ });
    fireEvent.click(budgetCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/Hashtags: #budget/)).toBeInTheDocument();
    });
  });

  it('should allow deselecting hashtags', async () => {
    render(<CommentFilters />, { wrapper: TestWrapper });

    // Select and then deselect a hashtag
    const budgetCheckbox = screen.getByRole('checkbox', { name: /#budget/ });
    
    fireEvent.click(budgetCheckbox);
    await waitFor(() => {
      expect(screen.getByText(/Hashtags: #budget/)).toBeInTheDocument();
    });

    fireEvent.click(budgetCheckbox);
    await waitFor(() => {
      expect(screen.queryByText(/Hashtags:/)).not.toBeInTheDocument();
    });
  });
});