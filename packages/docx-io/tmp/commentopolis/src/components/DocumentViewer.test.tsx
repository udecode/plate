import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DocumentViewer } from './DocumentViewer';
import type { UploadedDocument } from '../types';

const mockFile = new File(['content'], 'test.docx', {
  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
});

const createMockDocument = (overrides: Partial<UploadedDocument> = {}): UploadedDocument => ({
  id: 'test-doc-1',
  name: 'test-document.docx',
  file: mockFile,
  uploadDate: new Date('2023-01-01'),
  size: 1024,
  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ...overrides
});

describe('DocumentViewer', () => {
  it('should show processing state when document is being processed', () => {
    const document = createMockDocument({
      isProcessing: true
    });

    render(<DocumentViewer document={document} />);

    expect(screen.getByText('Processing document...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show error state when document processing failed', () => {
    const document = createMockDocument({
      processingError: 'Failed to parse document'
    });

    render(<DocumentViewer document={document} />);

    expect(screen.getByText('Error Processing Document')).toBeInTheDocument();
    expect(screen.getByText('Failed to parse document')).toBeInTheDocument();
  });

  it('should show no content state when transformed content is missing', () => {
    const document = createMockDocument({
      transformedContent: undefined
    });

    render(<DocumentViewer document={document} />);

    expect(screen.getByText('No Content Available')).toBeInTheDocument();
    expect(screen.getByText('Document content could not be transformed to HTML.')).toBeInTheDocument();
  });

  it('should display document with transformed content', () => {
    const document = createMockDocument({
      transformedContent: {
        html: '<p>This is <strong>bold</strong> text.</p>',
        plainText: 'This is bold text.',
        paragraphs: []
      }
    });

    render(<DocumentViewer document={document} />);

    // Check document header
    expect(screen.getByText('test-document.docx')).toBeInTheDocument();
    expect(screen.getByText(/Uploaded 1\/1\/2023/)).toBeInTheDocument();
    expect(screen.getAllByText(/1 KB/)).toHaveLength(2); // Appears in header and metadata

    // Check document content (HTML should be rendered)
    expect(screen.getByText('bold')).toBeInTheDocument();
    
    // Check that the paragraph element exists with HTML content
    const paragraphElement = screen.getByText('bold').closest('p');
    expect(paragraphElement).toBeInTheDocument();
    expect(paragraphElement?.textContent).toBe('This is bold text.');

    // Check metadata
    expect(screen.getByText('File size:')).toBeInTheDocument();
    expect(screen.getByText('Type:')).toBeInTheDocument();
    expect(screen.getByText('Characters:')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument(); // Character count
  });

  it('should display comment count when document has comments', () => {
    const document = createMockDocument({
      comments: [
        {
          id: 'comment-1',
          author: 'John Doe',
          date: new Date(),
          plainText: 'Test comment',
          content: '<p>Test comment</p>',
          documentId: 'test-doc-1'
        },
        {
          id: 'comment-2',
          author: 'Jane Doe',
          date: new Date(),
          plainText: 'Another comment',
          content: '<p>Another comment</p>',
          documentId: 'test-doc-1'
        }
      ],
      transformedContent: {
        html: '<p>Document content</p>',
        plainText: 'Document content',
        paragraphs: []
      }
    });

    render(<DocumentViewer document={document} />);

    expect(screen.getByText('2 comments')).toBeInTheDocument();
  });

  it('should display singular comment count when document has one comment', () => {
    const document = createMockDocument({
      comments: [
        {
          id: 'comment-1',
          author: 'John Doe',
          date: new Date(),
          plainText: 'Test comment',
          content: '<p>Test comment</p>',
          documentId: 'test-doc-1'
        }
      ],
      transformedContent: {
        html: '<p>Document content</p>',
        plainText: 'Document content',
        paragraphs: []
      }
    });

    render(<DocumentViewer document={document} />);

    expect(screen.getByText('1 comment')).toBeInTheDocument();
  });

  it('should not display comment count when document has no comments', () => {
    const document = createMockDocument({
      comments: [],
      transformedContent: {
        html: '<p>Document content</p>',
        plainText: 'Document content',
        paragraphs: []
      }
    });

    render(<DocumentViewer document={document} />);

    expect(screen.queryByText(/comment/)).not.toBeInTheDocument();
  });

  it('should render HTML content with proper formatting', () => {
    const document = createMockDocument({
      transformedContent: {
        html: '<p>Normal text</p><p style="text-align: center"><strong>Bold centered text</strong></p>',
        plainText: 'Normal text\nBold centered text',
        paragraphs: []
      }
    });

    render(<DocumentViewer document={document} />);

    // Check that HTML is rendered (not just text)
    const strongElement = screen.getByText('Bold centered text');
    expect(strongElement.tagName).toBe('STRONG');
    
    // Check that the paragraph has the style attribute
    const paragraph = strongElement.closest('p');
    expect(paragraph).toHaveStyle('text-align: center');
  });

  it('should handle large file sizes correctly', () => {
    const document = createMockDocument({
      size: 2048000, // 2MB
      transformedContent: {
        html: '<p>Large document content</p>',
        plainText: 'Large document content',
        paragraphs: []
      }
    });

    render(<DocumentViewer document={document} />);

    expect(screen.getAllByText(/2000 KB/)).toHaveLength(2); // Appears in header and metadata
  });
});