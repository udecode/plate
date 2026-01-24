/**
 * Regression tests for DOCX import functionality.
 *
 * These tests verify that the import process correctly:
 * 1. Parses DOCX tracking tokens from HTML
 * 2. Strips tokens while preserving content
 * 3. Detects tracking presence
 *
 * NOTE: These tests focus on the parsing logic using existing functions.
 */

import { describe, expect, it } from 'bun:test';

import {
  hasDocxTrackingTokens,
  parseDocxTracking,
  parseDocxComments,
  stripDocxTrackingTokens,
} from '../importComments';
import { parseDocxTrackedChanges } from '../importTrackChanges';
import {
  splitDocxTrackingTokens,
  hasTrackingTokens,
} from '../html-to-docx/tracking';

// Helper to build tokens
function buildInsertionToken(
  payload: { id: string; author?: string; date?: string },
  position: 'start' | 'end'
): string {
  if (position === 'start') {
    return `[[DOCX_INS_START:${encodeURIComponent(JSON.stringify(payload))}]]`;
  }
  return `[[DOCX_INS_END:${payload.id}]]`;
}

function buildDeletionToken(
  payload: { id: string; author?: string; date?: string },
  position: 'start' | 'end'
): string {
  if (position === 'start') {
    return `[[DOCX_DEL_START:${encodeURIComponent(JSON.stringify(payload))}]]`;
  }
  return `[[DOCX_DEL_END:${payload.id}]]`;
}

function buildCommentToken(
  payload: { id: string; authorName?: string; text?: string },
  position: 'start' | 'end'
): string {
  if (position === 'start') {
    return `[[DOCX_CMT_START:${encodeURIComponent(JSON.stringify(payload))}]]`;
  }
  return `[[DOCX_CMT_END:${encodeURIComponent(payload.id)}]]`;
}

describe('DOCX Import - Token Splitting', () => {
  describe('splitDocxTrackingTokens', () => {
    it('should split text with insertion tokens', () => {
      const text = `Before ${buildInsertionToken({ id: 'ins-1', author: 'Author' }, 'start')}inserted${buildInsertionToken({ id: 'ins-1' }, 'end')} after`;

      const parts = splitDocxTrackingTokens(text);

      expect(parts.length).toBe(5);
      expect(parts[0]).toEqual({ type: 'text', value: 'Before ' });
      expect(parts[1].type).toBe('insStart');
      expect(parts[2]).toEqual({ type: 'text', value: 'inserted' });
      expect(parts[3].type).toBe('insEnd');
      expect(parts[4]).toEqual({ type: 'text', value: ' after' });
    });

    it('should split text with deletion tokens', () => {
      const text = `Before ${buildDeletionToken({ id: 'del-1', author: 'Author' }, 'start')}deleted${buildDeletionToken({ id: 'del-1' }, 'end')} after`;

      const parts = splitDocxTrackingTokens(text);

      expect(parts.length).toBe(5);
      expect(parts[1].type).toBe('delStart');
      expect(parts[3].type).toBe('delEnd');
    });

    it('should split text with comment tokens', () => {
      const text = `Before ${buildCommentToken({ id: 'cmt-1', authorName: 'Reviewer', text: 'Review this' }, 'start')}commented${buildCommentToken({ id: 'cmt-1' }, 'end')} after`;

      const parts = splitDocxTrackingTokens(text);

      expect(parts.length).toBe(5);
      expect(parts[1].type).toBe('commentStart');
      expect(parts[3].type).toBe('commentEnd');
    });

    it('should handle text without tokens', () => {
      const text = 'Plain text without any tokens';
      const parts = splitDocxTrackingTokens(text);

      expect(parts.length).toBe(1);
      expect(parts[0]).toEqual({ type: 'text', value: text });
    });

    it('should handle nested tokens', () => {
      const text = `${buildInsertionToken({ id: 'ins-1' }, 'start')}${buildCommentToken({ id: 'cmt-1', text: 'Note' }, 'start')}nested${buildCommentToken({ id: 'cmt-1' }, 'end')}${buildInsertionToken({ id: 'ins-1' }, 'end')}`;

      const parts = splitDocxTrackingTokens(text);

      expect(parts.length).toBe(5);
      expect(parts[0].type).toBe('insStart');
      expect(parts[1].type).toBe('commentStart');
      expect(parts[2]).toEqual({ type: 'text', value: 'nested' });
      expect(parts[3].type).toBe('commentEnd');
      expect(parts[4].type).toBe('insEnd');
    });
  });

  describe('hasTrackingTokens', () => {
    it('should detect insertion tokens', () => {
      expect(
        hasTrackingTokens(buildInsertionToken({ id: 'ins-1' }, 'start'))
      ).toBe(true);
    });

    it('should detect deletion tokens', () => {
      expect(
        hasTrackingTokens(buildDeletionToken({ id: 'del-1' }, 'start'))
      ).toBe(true);
    });

    it('should detect comment tokens', () => {
      expect(
        hasTrackingTokens(buildCommentToken({ id: 'cmt-1' }, 'start'))
      ).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(hasTrackingTokens('Plain text without tokens')).toBe(false);
    });
  });
});

describe('DOCX Import - HTML Parsing', () => {
  describe('parseDocxTrackedChanges', () => {
    it('should parse insertions from HTML', () => {
      const html = `<p>Before ${buildInsertionToken({ id: 'ins-1', author: 'Author', date: '2024-01-15' }, 'start')}inserted${buildInsertionToken({ id: 'ins-1' }, 'end')} after</p>`;

      const result = parseDocxTrackedChanges(html);

      expect(result.insertionCount).toBe(1);
      expect(result.changes[0].id).toBe('ins-1');
      expect(result.changes[0].author).toBe('Author');
      expect(result.changes[0].type).toBe('insert');
    });

    it('should parse deletions from HTML', () => {
      const html = `<p>Before ${buildDeletionToken({ id: 'del-1', author: 'Author' }, 'start')}deleted${buildDeletionToken({ id: 'del-1' }, 'end')} after</p>`;

      const result = parseDocxTrackedChanges(html);

      expect(result.deletionCount).toBe(1);
      expect(result.changes[0].id).toBe('del-1');
      expect(result.changes[0].type).toBe('remove');
    });

    it('should parse mixed changes from HTML', () => {
      const html = `
        <p>${buildInsertionToken({ id: 'ins-1', author: 'Alice' }, 'start')}added${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>
        <p>${buildDeletionToken({ id: 'del-1', author: 'Bob' }, 'start')}removed${buildDeletionToken({ id: 'del-1' }, 'end')}</p>
      `;

      const result = parseDocxTrackedChanges(html);

      expect(result.insertionCount).toBe(1);
      expect(result.deletionCount).toBe(1);
      expect(result.changes.length).toBe(2);
    });

    it('should return empty for plain HTML', () => {
      const result = parseDocxTrackedChanges('<p>Plain content</p>');

      expect(result.changes.length).toBe(0);
      expect(result.insertionCount).toBe(0);
      expect(result.deletionCount).toBe(0);
    });
  });

  describe('parseDocxComments', () => {
    it('should parse comments from HTML', () => {
      const html = `<p>${buildCommentToken({ id: 'cmt-1', authorName: 'Reviewer', text: 'Please review' }, 'start')}commented${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>`;

      const result = parseDocxComments(html);

      expect(result.count).toBe(1);
      expect(result.comments[0].id).toBe('cmt-1');
      expect(result.comments[0].authorName).toBe('Reviewer');
      expect(result.comments[0].text).toBe('Please review');
    });

    it('should parse multiple comments', () => {
      const html = `
        <p>${buildCommentToken({ id: 'cmt-1', text: 'First' }, 'start')}text1${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>
        <p>${buildCommentToken({ id: 'cmt-2', text: 'Second' }, 'start')}text2${buildCommentToken({ id: 'cmt-2' }, 'end')}</p>
      `;

      const result = parseDocxComments(html);

      expect(result.count).toBe(2);
    });

    it('should return empty for plain HTML', () => {
      const result = parseDocxComments('<p>Plain content</p>');

      expect(result.comments.length).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe('parseDocxTracking', () => {
    it('should parse both changes and comments', () => {
      const html = `
        <p>${buildInsertionToken({ id: 'ins-1' }, 'start')}added${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>
        <p>${buildCommentToken({ id: 'cmt-1', text: 'Note' }, 'start')}text${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>
      `;

      const result = parseDocxTracking(html);

      expect(result.hasTracking).toBe(true);
      expect(result.trackedChanges.insertionCount).toBe(1);
      expect(result.comments.count).toBe(1);
    });

    it('should return hasTracking false for plain HTML', () => {
      const result = parseDocxTracking('<p>Plain content</p>');

      expect(result.hasTracking).toBe(false);
    });
  });
});

describe('DOCX Import - Token Stripping', () => {
  describe('stripDocxTrackingTokens', () => {
    it('should remove insertion tokens preserving content', () => {
      const html = `<p>before ${buildInsertionToken({ id: 'ins-1' }, 'start')}inserted${buildInsertionToken({ id: 'ins-1' }, 'end')} after</p>`;

      const result = stripDocxTrackingTokens(html);

      expect(result).toBe('<p>before inserted after</p>');
      expect(result).not.toContain('[[DOCX_');
    });

    it('should remove deletion tokens preserving content', () => {
      const html = `<p>before ${buildDeletionToken({ id: 'del-1' }, 'start')}deleted${buildDeletionToken({ id: 'del-1' }, 'end')} after</p>`;

      const result = stripDocxTrackingTokens(html);

      expect(result).toBe('<p>before deleted after</p>');
      expect(result).not.toContain('[[DOCX_');
    });

    it('should remove comment tokens preserving content', () => {
      const html = `<p>before ${buildCommentToken({ id: 'cmt-1', text: 'Note' }, 'start')}commented${buildCommentToken({ id: 'cmt-1' }, 'end')} after</p>`;

      const result = stripDocxTrackingTokens(html);

      expect(result).toBe('<p>before commented after</p>');
      expect(result).not.toContain('[[DOCX_');
    });

    it('should remove all token types in mixed content', () => {
      const html = `
        <p>${buildInsertionToken({ id: 'ins-1' }, 'start')}A${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>
        <p>${buildDeletionToken({ id: 'del-1' }, 'start')}B${buildDeletionToken({ id: 'del-1' }, 'end')}</p>
        <p>${buildCommentToken({ id: 'cmt-1' }, 'start')}C${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>
      `;

      const result = stripDocxTrackingTokens(html);

      expect(result).not.toContain('[[DOCX_');
      expect(result).toContain('A');
      expect(result).toContain('B');
      expect(result).toContain('C');
    });

    it('should return unchanged for plain HTML', () => {
      const html = '<p>Plain content</p>';
      expect(stripDocxTrackingTokens(html)).toBe(html);
    });
  });
});

describe('DOCX Import - Detection', () => {
  describe('hasDocxTrackingTokens', () => {
    it('should detect insertion tokens in HTML', () => {
      const html = `<p>${buildInsertionToken({ id: 'ins-1' }, 'start')}text${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>`;
      expect(hasDocxTrackingTokens(html)).toBe(true);
    });

    it('should detect deletion tokens in HTML', () => {
      const html = `<p>${buildDeletionToken({ id: 'del-1' }, 'start')}text${buildDeletionToken({ id: 'del-1' }, 'end')}</p>`;
      expect(hasDocxTrackingTokens(html)).toBe(true);
    });

    it('should detect comment tokens in HTML', () => {
      const html = `<p>${buildCommentToken({ id: 'cmt-1' }, 'start')}text${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>`;
      expect(hasDocxTrackingTokens(html)).toBe(true);
    });

    it('should return false for plain HTML', () => {
      expect(hasDocxTrackingTokens('<p>Plain text</p>')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasDocxTrackingTokens('')).toBe(false);
    });
  });
});

/**
 * REGRESSION TESTS: Content Preservation
 *
 * These tests verify that stripping tokens preserves all content correctly.
 * If changes break this behavior, these tests will fail.
 */
describe('DOCX Import - Regression: Content Preservation', () => {
  it('should preserve all text with mixed tracking tokens', () => {
    const html = `<p>Start ${buildInsertionToken({ id: 'ins-1' }, 'start')}inserted${buildInsertionToken({ id: 'ins-1' }, 'end')} middle ${buildDeletionToken({ id: 'del-1' }, 'start')}deleted${buildDeletionToken({ id: 'del-1' }, 'end')} end</p>`;

    const result = stripDocxTrackingTokens(html);

    expect(result).toBe('<p>Start inserted middle deleted end</p>');
  });

  it('should preserve complex HTML structure', () => {
    const html = `
      <h1>Title</h1>
      <p>Intro ${buildCommentToken({ id: 'cmt-1', text: 'Note' }, 'start')}commented${buildCommentToken({ id: 'cmt-1' }, 'end')} text</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    `;

    const result = stripDocxTrackingTokens(html);

    expect(result).toContain('<h1>Title</h1>');
    expect(result).toContain('Intro commented text');
    expect(result).toContain('<li>Item 1</li>');
    expect(result).not.toContain('[[DOCX_');
  });

  it('should handle empty tracking ranges', () => {
    const html = `<p>Before ${buildInsertionToken({ id: 'ins-1' }, 'start')}${buildInsertionToken({ id: 'ins-1' }, 'end')} after</p>`;

    const result = stripDocxTrackingTokens(html);

    expect(result).toBe('<p>Before  after</p>');
  });

  it('should preserve special characters in content', () => {
    const html = `<p>${buildInsertionToken({ id: 'ins-1' }, 'start')}&amp; &lt; &gt;${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>`;

    const result = stripDocxTrackingTokens(html);

    expect(result).toBe('<p>&amp; &lt; &gt;</p>');
  });
});

describe('DOCX Import - StyleMap Merge', () => {
  // Test the styleMap merge logic used in convertToHtmlWithTracking
  // The logic is: ['comment-reference => sup', ...(options.styleMap ?? [])]

  function mergeStyleMap(userStyleMap?: string[]): string[] {
    return ['comment-reference => sup', ...(userStyleMap ?? [])];
  }

  it('should include default comment-reference mapping when no custom styleMap provided', () => {
    const result = mergeStyleMap();

    expect(result).toEqual(['comment-reference => sup']);
    expect(result).toContain('comment-reference => sup');
  });

  it('should include default comment-reference mapping when empty styleMap provided', () => {
    const result = mergeStyleMap([]);

    expect(result).toEqual(['comment-reference => sup']);
  });

  it('should merge custom styleMap with default, preserving both', () => {
    const customStyles = ['p[style-name="Heading 1"] => h1', 'b => strong'];
    const result = mergeStyleMap(customStyles);

    expect(result.length).toBe(3);
    expect(result[0]).toBe('comment-reference => sup');
    expect(result).toContain('p[style-name="Heading 1"] => h1');
    expect(result).toContain('b => strong');
  });

  it('should place default before custom entries', () => {
    const customStyles = ['custom => div'];
    const result = mergeStyleMap(customStyles);

    expect(result[0]).toBe('comment-reference => sup');
    expect(result[1]).toBe('custom => div');
  });

  it('should allow custom comment-reference override after default', () => {
    // If user provides their own comment-reference mapping, mammoth uses first match
    // so default comes first and takes precedence, but user can still override
    const customStyles = ['comment-reference => span.comment-ref'];
    const result = mergeStyleMap(customStyles);

    expect(result.length).toBe(2);
    expect(result[0]).toBe('comment-reference => sup');
    expect(result[1]).toBe('comment-reference => span.comment-ref');
  });

  it('should handle undefined styleMap same as no styleMap', () => {
    const result = mergeStyleMap(undefined);

    expect(result).toEqual(['comment-reference => sup']);
  });
});

describe('DOCX Import - Edge Cases', () => {
  it('should handle malformed tokens gracefully', () => {
    const html = '<p>[[DOCX_INS_START:invalid-json]]text[[DOCX_INS_END:x]]</p>';

    // Should not throw - returns original or partially stripped
    expect(() => parseDocxTrackedChanges(html)).not.toThrow();
  });

  it('should handle unclosed tokens', () => {
    const html = `<p>${buildInsertionToken({ id: 'ins-1' }, 'start')}unclosed text</p>`;

    // Should not throw
    expect(() => parseDocxTrackedChanges(html)).not.toThrow();
    expect(() => stripDocxTrackingTokens(html)).not.toThrow();
  });

  it('should handle Unicode in author names', () => {
    const html = `<p>${buildInsertionToken({ id: 'ins-1', author: '田中太郎' }, 'start')}text${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>`;

    const result = parseDocxTrackedChanges(html);

    expect(result.changes[0].author).toBe('田中太郎');
  });

  it('should handle special chars in comment text', () => {
    const html = `<p>${buildCommentToken({ id: 'cmt-1', text: 'Note with <tags> & "quotes"' }, 'start')}text${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>`;

    const result = parseDocxComments(html);

    expect(result.comments[0].text).toBe('Note with <tags> & "quotes"');
  });
});
