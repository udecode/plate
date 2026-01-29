import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MultipleCommentDetails } from './MultipleCommentDetails';
import type { DocumentComment, UploadedDocument, DocumentFootnote } from '../types';

describe('MultipleCommentDetails with footnotes/endnotes', () => {
  const mockFootnotes: DocumentFootnote[] = [
    {
      id: 'doc-1-footnote-1',
      type: 'footnote',
      content: '<p>Footnote content for testing.</p>',
      plainText: 'Footnote content for testing.',
      documentId: 'doc-1',
      noteType: 'normal'
    }
  ];

  const mockEndnotes: DocumentFootnote[] = [
    {
      id: 'doc-1-endnote-1',
      type: 'endnote',
      content: '<p>Endnote content for testing.</p>',
      plainText: 'Endnote content for testing.',
      documentId: 'doc-1',
      noteType: 'normal'
    }
  ];

  const mockDocument: UploadedDocument = {
    id: 'doc-1',
    name: 'Test Document.docx',
    file: new File([], 'test.docx'),
    uploadDate: new Date(),
    size: 1000,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    footnotes: mockFootnotes,
    endnotes: mockEndnotes,
    transformedContent: {
      html: '<p>Test content</p>',
      plainText: 'Test content',
      paragraphs: [
        '<p>First paragraph with footnote<sup><a href="#footnote-1" class="footnote-link">1</a></sup>.</p>',
        '<p>Second paragraph with endnote<sup><a href="#endnote-1" class="endnote-link">1</a></sup>.</p>'
      ]
    }
  };

  const mockComments: DocumentComment[] = [
    {
      id: 'doc-1-comment-1',
      author: 'Author One',
      date: new Date('2023-12-01T10:00:00Z'),
      plainText: 'First comment',
      content: '<p>First comment content</p>',
      documentId: 'doc-1',
      paragraphIds: [0]
    },
    {
      id: 'doc-1-comment-2',
      author: 'Author Two',
      date: new Date('2023-12-02T10:00:00Z'),
      plainText: 'Second comment',
      content: '<p>Second comment content</p>',
      documentId: 'doc-1',
      paragraphIds: [1]
    }
  ];

  const getDocumentName = (documentId: string) => {
    return mockDocument.id === documentId ? mockDocument.name : 'Unknown';
  };

  it('should display footnotes for each comment that references paragraphs with footnotes', () => {
    render(
      <MultipleCommentDetails
        comments={[mockComments[0]]}
        documents={[mockDocument]}
        getDocumentName={getDocumentName}
      />
    );

    // Check that the paragraph with footnote is displayed
    expect(screen.getByText(/First paragraph with footnote/)).toBeInTheDocument();

    // Check that footnotes section is displayed
    expect(screen.getByText(/Footnotes/i)).toBeInTheDocument();

    // Check that footnote content is displayed
    expect(screen.getByText(/Footnote content for testing/)).toBeInTheDocument();
  });

  it('should display endnotes for each comment that references paragraphs with endnotes', () => {
    render(
      <MultipleCommentDetails
        comments={[mockComments[1]]}
        documents={[mockDocument]}
        getDocumentName={getDocumentName}
      />
    );

    // Check that the paragraph with endnote is displayed
    expect(screen.getByText(/Second paragraph with endnote/)).toBeInTheDocument();

    // Check that endnotes section is displayed
    expect(screen.getByText(/Endnotes/i)).toBeInTheDocument();

    // Check that endnote content is displayed
    expect(screen.getByText(/Endnote content for testing/)).toBeInTheDocument();
  });

  it('should display separate footnotes/endnotes for multiple comments', () => {
    render(
      <MultipleCommentDetails
        comments={mockComments}
        documents={[mockDocument]}
        getDocumentName={getDocumentName}
      />
    );

    // Check that both paragraphs are displayed
    expect(screen.getByText(/First paragraph with footnote/)).toBeInTheDocument();
    expect(screen.getByText(/Second paragraph with endnote/)).toBeInTheDocument();

    // Check that both notes sections are displayed (possibly multiple times, once for each comment)
    const footnotesSections = screen.getAllByText(/Footnotes/i);
    expect(footnotesSections.length).toBeGreaterThan(0);

    const endnotesSections = screen.getAllByText(/Endnotes/i);
    expect(endnotesSections.length).toBeGreaterThan(0);

    // Check that both note contents are displayed
    expect(screen.getByText(/Footnote content for testing/)).toBeInTheDocument();
    expect(screen.getByText(/Endnote content for testing/)).toBeInTheDocument();
  });

  it('should handle documents without footnotes/endnotes gracefully', () => {
    const documentWithoutNotes: UploadedDocument = {
      ...mockDocument,
      footnotes: [],
      endnotes: [],
      transformedContent: {
        html: '<p>Test content</p>',
        plainText: 'Test content',
        paragraphs: ['<p>Simple paragraph without notes.</p>']
      }
    };

    const simpleComment: DocumentComment = {
      id: 'doc-1-comment-3',
      author: 'Author Three',
      date: new Date('2023-12-03T10:00:00Z'),
      plainText: 'Third comment',
      content: '<p>Third comment content</p>',
      documentId: 'doc-1',
      paragraphIds: [0]
    };

    render(
      <MultipleCommentDetails
        comments={[simpleComment]}
        documents={[documentWithoutNotes]}
        getDocumentName={getDocumentName}
      />
    );

    // Check that the paragraph is displayed
    expect(screen.getByText(/Simple paragraph without notes/)).toBeInTheDocument();

    // Check that notes sections are NOT displayed
    expect(screen.queryByText(/Footnotes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Endnotes/i)).not.toBeInTheDocument();
  });
});
