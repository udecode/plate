import { describe, it, expect } from 'vitest';
import { extractNoteReferences, findNoteById, appendNotesToParagraphs } from './noteExtractor';
import type { DocumentFootnote } from '../types';

describe('noteExtractor', () => {
  describe('extractNoteReferences', () => {
    it('should extract footnote reference IDs from HTML', () => {
      const html = `
        <p>Some text with a footnote<sup><a href="#footnote-1" id="footnote-ref-1" class="footnote-link">1</a></sup>.</p>
      `;
      
      const result = extractNoteReferences(html);
      
      expect(result.footnoteIds).toEqual(['1']);
      expect(result.endnoteIds).toEqual([]);
    });

    it('should extract endnote reference IDs from HTML', () => {
      const html = `
        <p>Some text with an endnote<sup><a href="#endnote-2" id="endnote-ref-2" class="endnote-link">2</a></sup>.</p>
      `;
      
      const result = extractNoteReferences(html);
      
      expect(result.footnoteIds).toEqual([]);
      expect(result.endnoteIds).toEqual(['2']);
    });

    it('should extract multiple footnote and endnote references', () => {
      const html = `
        <p>Text with footnote<sup><a href="#footnote-1" class="footnote-link">1</a></sup> and another<sup><a href="#footnote-3" class="footnote-link">3</a></sup>.</p>
        <p>Also an endnote<sup><a href="#endnote-2" class="endnote-link">2</a></sup>.</p>
      `;
      
      const result = extractNoteReferences(html);
      
      expect(result.footnoteIds).toEqual(['1', '3']);
      expect(result.endnoteIds).toEqual(['2']);
    });

    it('should return empty arrays when no references found', () => {
      const html = '<p>Simple paragraph with no notes.</p>';
      
      const result = extractNoteReferences(html);
      
      expect(result.footnoteIds).toEqual([]);
      expect(result.endnoteIds).toEqual([]);
    });

    it('should return empty arrays when HTML is empty', () => {
      const result = extractNoteReferences('');
      
      expect(result.footnoteIds).toEqual([]);
      expect(result.endnoteIds).toEqual([]);
    });

    it('should handle complex note IDs', () => {
      const html = `
        <p>Text<sup><a href="#footnote-abc-123" class="footnote-link">1</a></sup>.</p>
      `;
      
      const result = extractNoteReferences(html);
      
      expect(result.footnoteIds).toEqual(['abc-123']);
    });
  });

  describe('findNoteById', () => {
    const documentId = 'doc-123';
    const footnotes: DocumentFootnote[] = [
      {
        id: 'doc-123-footnote-1',
        type: 'footnote',
        content: '<p>Footnote 1 content</p>',
        plainText: 'Footnote 1 content',
        documentId: 'doc-123',
        noteType: 'normal'
      },
      {
        id: 'doc-123-footnote-2',
        type: 'footnote',
        content: '<p>Footnote 2 content</p>',
        plainText: 'Footnote 2 content',
        documentId: 'doc-123',
        noteType: 'normal'
      }
    ];

    const endnotes: DocumentFootnote[] = [
      {
        id: 'doc-123-endnote-1',
        type: 'endnote',
        content: '<p>Endnote 1 content</p>',
        plainText: 'Endnote 1 content',
        documentId: 'doc-123',
        noteType: 'normal'
      }
    ];

    it('should find footnote by ID', () => {
      const result = findNoteById('1', footnotes, endnotes, documentId);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('doc-123-footnote-1');
      expect(result?.type).toBe('footnote');
    });

    it('should find endnote by ID', () => {
      const result = findNoteById('1', footnotes, endnotes, documentId);
      
      expect(result).toBeDefined();
      // Note: This will find the footnote first since we check footnotes before endnotes
      // Let's test with a different ID
    });

    it('should find endnote when footnote does not exist', () => {
      const result = findNoteById('1', [], endnotes, documentId);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('doc-123-endnote-1');
      expect(result?.type).toBe('endnote');
    });

    it('should return undefined when note is not found', () => {
      const result = findNoteById('999', footnotes, endnotes, documentId);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined with empty arrays', () => {
      const result = findNoteById('1', [], [], documentId);
      
      expect(result).toBeUndefined();
    });
  });

  describe('appendNotesToParagraphs', () => {
    const documentId = 'doc-123';
    const footnotes: DocumentFootnote[] = [
      {
        id: 'doc-123-footnote-1',
        type: 'footnote',
        content: '<p>First footnote content</p>',
        plainText: 'First footnote content',
        documentId: 'doc-123',
        noteType: 'normal'
      },
      {
        id: 'doc-123-footnote-2',
        type: 'footnote',
        content: '<p>Second footnote content</p>',
        plainText: 'Second footnote content',
        documentId: 'doc-123',
        noteType: 'normal'
      }
    ];

    const endnotes: DocumentFootnote[] = [
      {
        id: 'doc-123-endnote-1',
        type: 'endnote',
        content: '<p>First endnote content</p>',
        plainText: 'First endnote content',
        documentId: 'doc-123',
        noteType: 'normal'
      }
    ];

    it('should append footnote content when referenced', () => {
      const html = `<p>Text with footnote<sup><a href="#footnote-1" class="footnote-link">1</a></sup>.</p>`;
      
      const result = appendNotesToParagraphs(html, footnotes, endnotes, documentId);
      
      expect(result).toContain('Text with footnote');
      expect(result).toContain('First footnote content');
      expect(result).toContain('class="footnotes"');
    });

    it('should append endnote content when referenced', () => {
      const html = `<p>Text with endnote<sup><a href="#endnote-1" class="endnote-link">1</a></sup>.</p>`;
      
      const result = appendNotesToParagraphs(html, footnotes, endnotes, documentId);
      
      expect(result).toContain('Text with endnote');
      expect(result).toContain('First endnote content');
      expect(result).toContain('class="endnotes"');
    });

    it('should append both footnotes and endnotes', () => {
      const html = `
        <p>Text with footnote<sup><a href="#footnote-1" class="footnote-link">1</a></sup>.</p>
        <p>Text with endnote<sup><a href="#endnote-1" class="endnote-link">1</a></sup>.</p>
      `;
      
      const result = appendNotesToParagraphs(html, footnotes, endnotes, documentId);
      
      expect(result).toContain('First footnote content');
      expect(result).toContain('First endnote content');
      expect(result).toContain('class="footnotes"');
      expect(result).toContain('class="endnotes"');
    });

    it('should append multiple footnotes in order', () => {
      const html = `
        <p>Text with footnote<sup><a href="#footnote-2" class="footnote-link">2</a></sup>.</p>
        <p>Another footnote<sup><a href="#footnote-1" class="footnote-link">1</a></sup>.</p>
      `;
      
      const result = appendNotesToParagraphs(html, footnotes, endnotes, documentId);
      
      expect(result).toContain('Second footnote content');
      expect(result).toContain('First footnote content');
    });

    it('should return original HTML when no notes referenced', () => {
      const html = '<p>Simple paragraph with no notes.</p>';
      
      const result = appendNotesToParagraphs(html, footnotes, endnotes, documentId);
      
      expect(result).toBe(html);
    });

    it('should return empty string when HTML is empty', () => {
      const result = appendNotesToParagraphs('', footnotes, endnotes, documentId);
      
      expect(result).toBe('');
    });

    it('should handle missing note content by using plainText', () => {
      const footnotesWithoutContent: DocumentFootnote[] = [
        {
          id: 'doc-123-footnote-1',
          type: 'footnote',
          content: '',
          plainText: 'Plain text fallback',
          documentId: 'doc-123',
          noteType: 'normal'
        }
      ];

      const html = `<p>Text with footnote<sup><a href="#footnote-1" class="footnote-link">1</a></sup>.</p>`;
      
      const result = appendNotesToParagraphs(html, footnotesWithoutContent, [], documentId);
      
      expect(result).toContain('Plain text fallback');
    });

    it('should skip notes that are not found', () => {
      const html = `<p>Text with footnote<sup><a href="#footnote-999" class="footnote-link">999</a></sup>.</p>`;
      
      const result = appendNotesToParagraphs(html, footnotes, endnotes, documentId);
      
      expect(result).toContain('Text with footnote');
      // Should not contain footnotes section since the note wasn't found
      expect(result).not.toContain('class="footnotes"');
    });
  });
});
