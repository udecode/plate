import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentDetails } from './CommentDetails';
import type { DocumentComment, DocumentFootnote } from '../types';

describe('CommentDetails with footnotes/endnotes', () => {
  const mockComment: DocumentComment = {
    id: 'doc-1-comment-1',
    author: 'Test Author',
    date: new Date('2023-12-01T10:00:00Z'),
    plainText: 'This is a test comment',
    content: '<p>This is a test comment</p>',
    documentId: 'doc-1',
    paragraphIds: [0, 1]
  };

  const mockFootnotes: DocumentFootnote[] = [
    {
      id: 'doc-1-footnote-1',
      type: 'footnote',
      content: '<p>This is the first footnote content.</p>',
      plainText: 'This is the first footnote content.',
      documentId: 'doc-1',
      noteType: 'normal'
    },
    {
      id: 'doc-1-footnote-2',
      type: 'footnote',
      content: '<p>This is the second footnote content.</p>',
      plainText: 'This is the second footnote content.',
      documentId: 'doc-1',
      noteType: 'normal'
    }
  ];

  const mockEndnotes: DocumentFootnote[] = [
    {
      id: 'doc-1-endnote-1',
      type: 'endnote',
      content: '<p>This is the first endnote content.</p>',
      plainText: 'This is the first endnote content.',
      documentId: 'doc-1',
      noteType: 'normal'
    }
  ];

  it('should display footnotes when referenced in paragraph', () => {
    const paragraphsWithFootnote = [
      '<p>This is a paragraph with a footnote reference<sup><a href="#footnote-1" id="footnote-ref-1" class="footnote-link">1</a></sup>.</p>',
      '<p>Another paragraph with a different footnote<sup><a href="#footnote-2" id="footnote-ref-2" class="footnote-link">2</a></sup>.</p>'
    ];

    render(
      <CommentDetails
        comment={mockComment}
        documentParagraphs={paragraphsWithFootnote}
        documentFootnotes={mockFootnotes}
        documentEndnotes={[]}
      />
    );

    // Check that the paragraph content is displayed
    expect(screen.getByText(/This is a paragraph with a footnote reference/)).toBeInTheDocument();

    // Check that footnotes section is displayed
    expect(screen.getByText(/Footnotes/i)).toBeInTheDocument();

    // Check that footnote content is displayed
    expect(screen.getByText(/This is the first footnote content/)).toBeInTheDocument();
    expect(screen.getByText(/This is the second footnote content/)).toBeInTheDocument();
  });

  it('should display endnotes when referenced in paragraph', () => {
    const paragraphsWithEndnote = [
      '<p>This is a paragraph with an endnote reference<sup><a href="#endnote-1" id="endnote-ref-1" class="endnote-link">1</a></sup>.</p>'
    ];

    render(
      <CommentDetails
        comment={mockComment}
        documentParagraphs={paragraphsWithEndnote}
        documentFootnotes={[]}
        documentEndnotes={mockEndnotes}
      />
    );

    // Check that the paragraph content is displayed
    expect(screen.getByText(/This is a paragraph with an endnote reference/)).toBeInTheDocument();

    // Check that endnotes section is displayed
    expect(screen.getByText(/Endnotes/i)).toBeInTheDocument();

    // Check that endnote content is displayed
    expect(screen.getByText(/This is the first endnote content/)).toBeInTheDocument();
  });

  it('should display both footnotes and endnotes when both are referenced', () => {
    const paragraphsWithBoth = [
      '<p>Paragraph with footnote<sup><a href="#footnote-1" class="footnote-link">1</a></sup> and endnote<sup><a href="#endnote-1" class="endnote-link">1</a></sup>.</p>'
    ];

    render(
      <CommentDetails
        comment={mockComment}
        documentParagraphs={paragraphsWithBoth}
        documentFootnotes={mockFootnotes}
        documentEndnotes={mockEndnotes}
      />
    );

    // Check that both sections are displayed
    expect(screen.getByText(/Footnotes/i)).toBeInTheDocument();
    expect(screen.getByText(/Endnotes/i)).toBeInTheDocument();

    // Check that both note contents are displayed
    expect(screen.getByText(/This is the first footnote content/)).toBeInTheDocument();
    expect(screen.getByText(/This is the first endnote content/)).toBeInTheDocument();
  });

  it('should not display notes section when no notes are referenced', () => {
    const paragraphsWithoutNotes = [
      '<p>This is a simple paragraph without any notes.</p>'
    ];

    render(
      <CommentDetails
        comment={mockComment}
        documentParagraphs={paragraphsWithoutNotes}
        documentFootnotes={mockFootnotes}
        documentEndnotes={mockEndnotes}
      />
    );

    // Check that the paragraph content is displayed
    expect(screen.getByText(/This is a simple paragraph without any notes/)).toBeInTheDocument();

    // Check that notes sections are NOT displayed
    expect(screen.queryByText(/Footnotes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Endnotes/i)).not.toBeInTheDocument();
  });

  it('should handle missing note content by using plainText', () => {
    const footnotesWithoutContent: DocumentFootnote[] = [
      {
        id: 'doc-1-footnote-1',
        type: 'footnote',
        content: '',
        plainText: 'Plain text fallback for footnote',
        documentId: 'doc-1',
        noteType: 'normal'
      }
    ];

    const paragraphsWithFootnote = [
      '<p>Paragraph with footnote<sup><a href="#footnote-1" class="footnote-link">1</a></sup>.</p>'
    ];

    render(
      <CommentDetails
        comment={mockComment}
        documentParagraphs={paragraphsWithFootnote}
        documentFootnotes={footnotesWithoutContent}
        documentEndnotes={[]}
      />
    );

    // Check that fallback plainText is used
    expect(screen.getByText(/Plain text fallback for footnote/)).toBeInTheDocument();
  });
});
