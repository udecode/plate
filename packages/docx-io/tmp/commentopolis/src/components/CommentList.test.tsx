import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { CommentList } from './CommentList';
import { CommentFilterProvider } from '../contexts/CommentFilterContext';
import type { DocumentComment, UploadedDocument } from '../types';

// Test wrapper component that provides the CommentFilterProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <CommentFilterProvider>
    {children}
  </CommentFilterProvider>
);

// Mock the useDocumentContext hook
const mockSetSelectedComment = vi.fn();
const mockToggleCommentSelection = vi.fn();
const mockUseDocumentContext = vi.fn();

vi.mock('../hooks/useDocumentContext', () => ({
  useDocumentContext: () => mockUseDocumentContext(),
}));

describe('CommentList', () => {
  const mockDocuments: UploadedDocument[] = [
    {
      id: 'doc1',
      name: 'Test Document 1.docx',
      file: new File([''], 'test1.docx'),
      uploadDate: new Date('2023-01-01'),
      size: 1000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
      id: 'doc2',
      name: 'Test Document 2.docx',
      file: new File([''], 'test2.docx'),
      uploadDate: new Date('2023-01-02'),
      size: 2000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  ];

  const mockComments: DocumentComment[] = [
    {
      id: 'comment1',
      author: 'John Doe',
      initial: 'JD',
      date: new Date('2023-01-01T10:00:00Z'),
      plainText: 'This is the first comment',
      content: '<p>This is the first comment</p>',
      documentId: 'doc1',
      reference: 'Comment 1',
    },
    {
      id: 'comment2',
      author: 'Jane Smith',
      initial: 'JS',
      date: new Date('2023-01-01T11:00:00Z'),
      plainText: 'This is the second comment',
      content: '<p>This is the second comment</p>',
      documentId: 'doc1',
      reference: 'Comment 2',
    },
    {
      id: 'comment3',
      author: 'Bob Johnson',
      initial: 'BJ',
      date: new Date('2023-01-02T09:00:00Z'),
      plainText: 'This is a comment from another document',
      content: '<p>This is a comment from another document</p>',
      documentId: 'doc2',
      reference: 'Comment 3',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: [],
      comments: mockComments,
      selectedCommentId: null,
      selectedCommentIds: [],
      setSelectedComment: mockSetSelectedComment,
      toggleCommentSelection: mockToggleCommentSelection,
    });
  });

  it('should render empty state when no comments are available', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: [],
      activeDocumentId: null,
      selectedDocumentIds: [],
      comments: [],
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    expect(screen.getByText('No comments found')).toBeInTheDocument();
    expect(screen.getByText('Upload a .docx document to see extracted comments')).toBeInTheDocument();
  });

  it('should render all comments when no active document is selected', () => {
    render(<CommentList />, { wrapper: TestWrapper });

    expect(screen.getByText('No comments found')).toBeInTheDocument();
    expect(screen.getByText('Select one or more documents to view their comments')).toBeInTheDocument();
  });

  it('should render only comments from active document when one is selected', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: 'doc1',
      selectedDocumentIds: [],
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    expect(screen.getByText('Comments (Test Document 1.docx)')).toBeInTheDocument();
    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    expect(screen.getByText('This is the second comment')).toBeInTheDocument();
    expect(screen.queryByText('This is a comment from another document')).not.toBeInTheDocument();
  });

  it('should render comments from selected documents', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1'],
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    expect(screen.getByText('Comments (Test Document 1.docx)')).toBeInTheDocument();
    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    expect(screen.getByText('This is the second comment')).toBeInTheDocument();
    expect(screen.queryByText('This is a comment from another document')).not.toBeInTheDocument();
  });

  it('should render comments from multiple selected documents', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    expect(screen.getByText('Comments (2 documents, 3 total)')).toBeInTheDocument();
    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    expect(screen.getByText('This is the second comment')).toBeInTheDocument();
    expect(screen.getByText('This is a comment from another document')).toBeInTheDocument();
    // Should show document headers for multiple documents
    expect(screen.getByText('📄 Test Document 1.docx (2)')).toBeInTheDocument();
    expect(screen.getByText('📄 Test Document 2.docx (1)')).toBeInTheDocument();
  });

  it('should handle comment selection', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    const firstComment = screen.getByText('This is the first comment').closest('div');
    expect(firstComment).toBeInTheDocument();

    fireEvent.click(firstComment!);
    expect(mockToggleCommentSelection).toHaveBeenCalledWith('comment1', false);
  });

  it('should show selected comment with visual indicator', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      comments: mockComments,
      selectedCommentId: 'comment1',
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: ['comment1'],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    expect(screen.getByText(/✓ Selected for review/)).toBeInTheDocument();
  });

  it('should allow deselection of selected comment', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      comments: mockComments,
      selectedCommentId: 'comment1',
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: ['comment1'],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    const firstComment = screen.getByText('This is the first comment').closest('div');
    fireEvent.click(firstComment!);
    expect(mockToggleCommentSelection).toHaveBeenCalledWith('comment1', false);
  });

  it('should render author initials and names correctly', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display comment references', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    expect(screen.getByText('Comment 1')).toBeInTheDocument();
    expect(screen.getByText('Comment 2')).toBeInTheDocument();
    expect(screen.getByText('Comment 3')).toBeInTheDocument();
  });

  it('should handle sorting by document order (default)', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    const commentElements = screen.getAllByText(/This is/);
    // Should be sorted by document order (comment1, comment2, comment3)
    expect(commentElements[0]).toHaveTextContent('This is the first comment'); // comment1
    expect(commentElements[1]).toHaveTextContent('This is the second comment'); // comment2
    expect(commentElements[2]).toHaveTextContent('This is a comment from another document'); // comment3
  });

  it('should allow sorting by author ascending', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'author-asc' } });

    const commentElements = screen.getAllByText(/This is/);
    // Should be sorted by author A-Z
    expect(commentElements[0]).toHaveTextContent('This is a comment from another document'); // Bob Johnson
    expect(commentElements[1]).toHaveTextContent('This is the second comment'); // Jane Smith
    expect(commentElements[2]).toHaveTextContent('This is the first comment'); // John Doe
  });

  it('should show document groupings when multiple documents have comments', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      comments: mockComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    expect(screen.getByText('📄 Test Document 1.docx (2)')).toBeInTheDocument();
    expect(screen.getByText('📄 Test Document 2.docx (1)')).toBeInTheDocument();
  });

  it('should display empty state for documents with no comments', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: 'doc1',
      selectedDocumentIds: [],
      comments: [],
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    expect(screen.getByText('No comments found')).toBeInTheDocument();
    expect(screen.getByText('No comments were found in the selected document(s)')).toBeInTheDocument();
  });

  it('should display threaded comments with visual indentation', () => {
    const threadedComments: DocumentComment[] = [
      {
        id: 'parent1',
        paraId: 'para1',
        author: 'Alice',
        initial: 'A',
        date: new Date('2023-01-01T10:00:00Z'),
        plainText: 'Parent comment',
        content: '<p>Parent comment</p>',
        documentId: 'doc1',
        reference: 'Page 1',
        children: ['para2'],
      },
      {
        id: 'reply1',
        paraId: 'para2',
        author: 'Bob',
        initial: 'B',
        date: new Date('2023-01-01T11:00:00Z'),
        plainText: 'Reply to parent',
        content: '<p>Reply to parent</p>',
        documentId: 'doc1',
        reference: 'Page 1',
        parentId: 'para1',
      },
    ];

    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1'],
      comments: threadedComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    // Check for threading indicators
    expect(screen.getByText('↳ Reply')).toBeInTheDocument();
    expect(screen.getByText('1 reply')).toBeInTheDocument();
    expect(screen.getByText('Replying to:')).toBeInTheDocument();
  });

  it('should show navigation buttons for threaded comments', () => {
    const threadedComments: DocumentComment[] = [
      {
        id: 'parent1',
        paraId: 'para1',
        author: 'Alice',
        initial: 'A',
        date: new Date('2023-01-01T10:00:00Z'),
        plainText: 'Parent comment',
        content: '<p>Parent comment</p>',
        documentId: 'doc1',
        reference: 'Page 1',
        children: ['para2'],
      },
      {
        id: 'reply1',
        paraId: 'para2',
        author: 'Bob',
        initial: 'B',
        date: new Date('2023-01-01T11:00:00Z'),
        plainText: 'Reply to parent',
        content: '<p>Reply to parent</p>',
        documentId: 'doc1',
        reference: 'Page 1',
        parentId: 'para1',
      },
    ];

    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1'],
      comments: threadedComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    // Check for navigation buttons
    const viewButtons = screen.getAllByRole('button', { name: /View/ });
    expect(viewButtons.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: '↑ View' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '↓ View' })).toBeInTheDocument();
  });

  it('should navigate to parent comment when clicking parent navigation button', () => {
    const threadedComments: DocumentComment[] = [
      {
        id: 'parent1',
        paraId: 'para1',
        author: 'Alice',
        initial: 'A',
        date: new Date('2023-01-01T10:00:00Z'),
        plainText: 'Parent comment',
        content: '<p>Parent comment</p>',
        documentId: 'doc1',
        reference: 'Page 1',
        children: ['para2'],
      },
      {
        id: 'reply1',
        paraId: 'para2',
        author: 'Bob',
        initial: 'B',
        date: new Date('2023-01-01T11:00:00Z'),
        plainText: 'Reply to parent',
        content: '<p>Reply to parent</p>',
        documentId: 'doc1',
        reference: 'Page 1',
        parentId: 'para1',
      },
    ];

    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1'],
      comments: threadedComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    const parentNavButton = screen.getByRole('button', { name: '↑ View' });
    fireEvent.click(parentNavButton);

    expect(mockToggleCommentSelection).toHaveBeenCalledWith('parent1', false);
  });

  it('should navigate to child comment when clicking child navigation button', () => {
    const threadedComments: DocumentComment[] = [
      {
        id: 'parent1',
        paraId: 'para1',
        author: 'Alice',
        initial: 'A',
        date: new Date('2023-01-01T10:00:00Z'),
        plainText: 'Parent comment',
        content: '<p>Parent comment</p>',
        documentId: 'doc1',
        reference: 'Page 1',
        children: ['para2'],
      },
      {
        id: 'reply1',
        paraId: 'para2',
        author: 'Bob',
        initial: 'B',
        date: new Date('2023-01-01T11:00:00Z'),
        plainText: 'Reply to parent',
        content: '<p>Reply to parent</p>',
        documentId: 'doc1',
        reference: 'Page 1',
        parentId: 'para1',
      },
    ];

    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1'],
      comments: threadedComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });

    const childNavButton = screen.getByRole('button', { name: '↓ View' });
    fireEvent.click(childNavButton);

    expect(mockToggleCommentSelection).toHaveBeenCalledWith('reply1', false);
  });

  it('should preserve threading with document order sorting', () => {
    const threadedComments: DocumentComment[] = [
      {
        id: 'doc1-comment1',
        paraId: 'para1',
        author: 'Alice',
        initial: 'A',
        date: new Date('2023-01-01T10:00:00Z'),
        plainText: 'Parent comment',
        content: '<p>Parent comment</p>',
        documentId: 'doc1',
        reference: 'Page 1',
        children: ['para2'],
      },
      {
        id: 'doc1-comment2',
        paraId: 'para2',
        author: 'Bob',
        initial: 'B',
        date: new Date('2023-01-01T11:00:00Z'),
        plainText: 'Reply to parent',
        content: '<p>Reply to parent</p>',
        documentId: 'doc1',
        reference: 'Page 1',
        parentId: 'para1',
      },
      {
        id: 'doc1-comment3',
        paraId: 'para3',
        author: 'Charlie',
        initial: 'C',
        date: new Date('2023-01-01T12:00:00Z'),
        plainText: 'Another top-level comment',
        content: '<p>Another top-level comment</p>',
        documentId: 'doc1',
        reference: 'Page 2',
        children: [],
      },
    ];

    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1'],
      comments: threadedComments,
      selectedCommentId: null,
      setSelectedComment: mockSetSelectedComment,
      selectedCommentIds: [],
      toggleCommentSelection: mockToggleCommentSelection,
    });

    render(<CommentList />, { wrapper: TestWrapper });
    
    // Check that threading indicators are present
    expect(screen.getByText('↳ Reply')).toBeInTheDocument();
    expect(screen.getByText('1 reply')).toBeInTheDocument();
    expect(screen.getByText('Replying to:')).toBeInTheDocument();
    
    // Verify all comments are rendered
    expect(screen.getAllByText(/Parent comment/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Reply to parent/).length).toBeGreaterThan(0);
    expect(screen.getByText('Another top-level comment')).toBeInTheDocument();
  });
});