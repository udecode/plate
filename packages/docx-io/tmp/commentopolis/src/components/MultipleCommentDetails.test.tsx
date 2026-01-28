import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MultipleCommentDetails } from './MultipleCommentDetails';
import type { DocumentComment, UploadedDocument } from '../types';

describe('MultipleCommentDetails', () => {
  const mockDocuments: UploadedDocument[] = [
    {
      id: 'doc1',
      name: 'Test Document 1.docx',
      file: new File([''], 'test1.docx'),
      uploadDate: new Date('2023-01-01'),
      size: 1000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      transformedContent: {
        html: '<p>Paragraph 1</p><p>Paragraph 2</p>',
        plainText: 'Paragraph 1\nParagraph 2',
        paragraphs: ['<p>Paragraph 1</p>', '<p>Paragraph 2</p>'],
      },
    },
    {
      id: 'doc2',
      name: 'Test Document 2.docx',
      file: new File([''], 'test2.docx'),
      uploadDate: new Date('2023-01-02'),
      size: 2000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      transformedContent: {
        html: '<p>Another paragraph</p>',
        plainText: 'Another paragraph',
        paragraphs: ['<p>Another paragraph</p>'],
      },
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
      paragraphIds: [0],
    },
    {
      id: 'comment2',
      author: 'Jane Smith',
      initial: 'JS',
      date: new Date('2023-01-01T11:00:00Z'),
      plainText: 'This is the second comment',
      content: '<p>This is the second comment</p>',
      documentId: 'doc1',
      paragraphIds: [1],
    },
    {
      id: 'comment3',
      author: 'Bob Johnson',
      initial: 'BJ',
      date: new Date('2023-01-02T09:00:00Z'),
      plainText: 'This is a comment from another document',
      content: '<p>This is a comment from another document</p>',
      documentId: 'doc2',
      paragraphIds: [0],
    },
  ];

  const getDocumentName = (documentId: string): string => {
    const doc = mockDocuments.find(d => d.id === documentId);
    return doc?.name || 'Unknown Document';
  };

  it('should render empty state when no comments are selected', () => {
    render(
      <MultipleCommentDetails 
        comments={[]} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    expect(screen.getByText('Select comments to view details')).toBeInTheDocument();
    expect(screen.getByText(/Hold Ctrl/)).toBeInTheDocument();
  });

  it('should render single comment details', () => {
    render(
      <MultipleCommentDetails 
        comments={[mockComments[0]]} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    expect(screen.getByText('Comment Details')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    // Document name appears in two places: label and paragraph reference
    expect(screen.getAllByText(/Test Document 1.docx/).length).toBeGreaterThan(0);
  });

  it('should render multiple comments with header', () => {
    render(
      <MultipleCommentDetails 
        comments={mockComments} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    expect(screen.getByText('3 Selected Comments')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should display referenced paragraphs for each comment', () => {
    render(
      <MultipleCommentDetails 
        comments={[mockComments[0], mockComments[1]]} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    // Check for paragraph references (using getAllByText since there are two)
    const paragraphRefs = screen.getAllByText(/Referenced Paragraph from Test Document 1.docx/);
    expect(paragraphRefs.length).toBe(2);
  });

  it('should show comment numbers', () => {
    render(
      <MultipleCommentDetails 
        comments={mockComments} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    // Check for numbered indicators by looking for the badge elements with specific classes
    const badges = document.querySelectorAll('.bg-gradient-to-br.from-blue-500.to-purple-600');
    expect(badges.length).toBe(3);
    expect(badges[0].textContent).toBe('1');
    expect(badges[1].textContent).toBe('2');
    expect(badges[2].textContent).toBe('3');
  });

  it('should display summary footer for multiple comments', () => {
    render(
      <MultipleCommentDetails 
        comments={mockComments} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    expect(screen.getByText(/Total comments:/)).toBeInTheDocument();
    expect(screen.getByText(/Documents:/)).toBeInTheDocument();
    expect(screen.getByText(/Authors:/)).toBeInTheDocument();
    expect(screen.getByText(/3 different authors/)).toBeInTheDocument();
  });

  it('should display done status for comments', () => {
    const doneComment: DocumentComment = {
      ...mockComments[0],
      done: true,
    };

    render(
      <MultipleCommentDetails 
        comments={[doneComment]} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    expect(screen.getByText('✓ Done')).toBeInTheDocument();
  });

  it('should display threading information', () => {
    const threadedComment: DocumentComment = {
      ...mockComments[0],
      parentId: 'parent-id',
      children: ['child1', 'child2'],
    };

    render(
      <MultipleCommentDetails 
        comments={[threadedComment]} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    // Threading info is shown together in one element
    expect(screen.getByText(/↳ Reply/)).toBeInTheDocument();
    expect(screen.getByText(/2 replies/)).toBeInTheDocument();
  });

  it('should handle comments without paragraphs', () => {
    const commentWithoutParagraphs: DocumentComment = {
      ...mockComments[0],
      paragraphIds: undefined,
      reference: 'Page 1, Line 5',
    };

    render(
      <MultipleCommentDetails 
        comments={[commentWithoutParagraphs]} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    expect(screen.getByText('Page 1, Line 5')).toBeInTheDocument();
  });

  it('should show document name for each comment in multi-selection', () => {
    render(
      <MultipleCommentDetails 
        comments={mockComments} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    // Each comment should have a document label
    const docLabels = screen.getAllByText(/Test Document/);
    expect(docLabels.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle single author in summary', () => {
    render(
      <MultipleCommentDetails 
        comments={[mockComments[0], mockComments[0]]} 
        documents={mockDocuments}
        getDocumentName={getDocumentName}
      />
    );

    // Check that the summary shows the single author name (not "X different authors")
    const summarySection = screen.getByText(/Authors:/);
    expect(summarySection.parentElement).toHaveTextContent('Authors: John Doe');
  });
});
