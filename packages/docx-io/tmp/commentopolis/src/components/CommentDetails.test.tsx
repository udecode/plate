import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CommentDetails } from './CommentDetails';
import type { DocumentComment } from '../types';

// Mock comment data for testing
const mockComment: DocumentComment = {
  id: 'test-comment-1',
  author: 'John Doe',
  initial: 'JD',
  date: new Date('2023-12-01T14:30:00Z'),
  plainText: 'This is a test comment for the component.',
  content: '<p>This is a test comment for the component.</p>',
  documentId: 'test-doc-1',
  reference: 'Page 1, Paragraph 2',
};

const mockGetDocumentName = (documentId: string): string => {
  if (documentId === 'test-doc-1') {
    return 'Test Document.docx';
  }
  return 'Unknown Document';
};

describe('CommentDetails', () => {
  it('should render empty state when no comment is provided', () => {
    render(<CommentDetails comment={null} />);
    
    expect(screen.getByText('Select a comment to view details')).toBeInTheDocument();
    expect(screen.getByText('Click on any comment in the center panel to see its details here.')).toBeInTheDocument();
  });

  it('should render comment details when comment is provided', () => {
    render(<CommentDetails comment={mockComment} getDocumentName={mockGetDocumentName} />);
    
    // Check for main heading
    expect(screen.getByText('Comment Details')).toBeInTheDocument();
    
    // Check author information
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // "JD" appears in both avatar and metadata, so we'll use getAllByText
    expect(screen.getAllByText('JD')).toHaveLength(2);
    
    // Check referenced paragraph (comment content is no longer displayed in CommentDetails)
    expect(screen.getByText('Referenced Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Page 1, Paragraph 2')).toBeInTheDocument();
    
    // Check metadata
    expect(screen.getByText('Comment ID:')).toBeInTheDocument();
    expect(screen.getByText('test-comment-1')).toBeInTheDocument();
    expect(screen.getByText('Initials:')).toBeInTheDocument();
  });

  it('should show document name when getDocumentName is provided', () => {
    render(<CommentDetails comment={mockComment} getDocumentName={mockGetDocumentName} />);
    
    expect(screen.getByText('Document:')).toBeInTheDocument();
    expect(screen.getByText('📄 Test Document.docx')).toBeInTheDocument();
  });

  it('should not show document section when getDocumentName is not provided', () => {
    render(<CommentDetails comment={mockComment} />);
    
    expect(screen.queryByText('Document:')).not.toBeInTheDocument();
  });

  it('should handle comment without reference', () => {
    const commentWithoutReference = { ...mockComment, reference: undefined };
    render(<CommentDetails comment={commentWithoutReference} />);
    
    expect(screen.queryByText('Referenced Paragraph')).not.toBeInTheDocument();
  });

  it('should handle comment without initials', () => {
    const commentWithoutInitials = { ...mockComment, initial: undefined };
    render(<CommentDetails comment={commentWithoutInitials} getDocumentName={mockGetDocumentName} />);
    
    // Should use first letter of author name as fallback
    expect(screen.getByText('J')).toBeInTheDocument();
    // Should not show initials in metadata section
    expect(screen.queryByText('Initials:')).not.toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<CommentDetails comment={mockComment} />);
    
    // The date should be formatted as a full date string
    expect(screen.getByText(/Friday, December 1, 2023 at 02:30 PM/)).toBeInTheDocument();
  });
});