/**
 * Unit tests for DOCX Tracked Changes and Comments Import Parsing.
 *
 * Tests the parsing utilities for extracting tracked changes and comments
 * from HTML that contains DOCX tracking tokens.
 */

import { describe, expect, it } from 'bun:test';

import {
  DOCX_DELETION_END_TOKEN_PREFIX,
  DOCX_DELETION_START_TOKEN_PREFIX,
  DOCX_DELETION_TOKEN_SUFFIX,
  DOCX_INSERTION_END_TOKEN_PREFIX,
  DOCX_INSERTION_START_TOKEN_PREFIX,
  DOCX_INSERTION_TOKEN_SUFFIX,
  parseDocxTrackedChanges,
} from './importTrackChanges';
import {
  DOCX_COMMENT_END_TOKEN_PREFIX,
  DOCX_COMMENT_START_TOKEN_PREFIX,
  DOCX_COMMENT_TOKEN_SUFFIX,
  hasDocxTrackingTokens,
  parseDocxComments,
  parseDocxTracking,
  stripDocxTrackingTokens,
} from './importComments';

// Helper to build tokens for testing
function buildInsertionToken(
  payload: { id: string; author?: string; date?: string },
  position: 'start' | 'end'
): string {
  if (position === 'start') {
    const encoded = encodeURIComponent(JSON.stringify(payload));
    return `${DOCX_INSERTION_START_TOKEN_PREFIX}${encoded}${DOCX_INSERTION_TOKEN_SUFFIX}`;
  }
  return `${DOCX_INSERTION_END_TOKEN_PREFIX}${payload.id}${DOCX_INSERTION_TOKEN_SUFFIX}`;
}

function buildDeletionToken(
  payload: { id: string; author?: string; date?: string },
  position: 'start' | 'end'
): string {
  if (position === 'start') {
    const encoded = encodeURIComponent(JSON.stringify(payload));
    return `${DOCX_DELETION_START_TOKEN_PREFIX}${encoded}${DOCX_DELETION_TOKEN_SUFFIX}`;
  }
  return `${DOCX_DELETION_END_TOKEN_PREFIX}${payload.id}${DOCX_DELETION_TOKEN_SUFFIX}`;
}

function buildCommentToken(
  payload: {
    id: string;
    authorName?: string;
    authorInitials?: string;
    date?: string;
    text?: string;
  },
  position: 'start' | 'end'
): string {
  if (position === 'start') {
    const encoded = encodeURIComponent(JSON.stringify(payload));
    return `${DOCX_COMMENT_START_TOKEN_PREFIX}${encoded}${DOCX_COMMENT_TOKEN_SUFFIX}`;
  }
  return `${DOCX_COMMENT_END_TOKEN_PREFIX}${encodeURIComponent(payload.id)}${DOCX_COMMENT_TOKEN_SUFFIX}`;
}

describe('Token Constants Export', () => {
  it('should export all token constants', () => {
    expect(DOCX_INSERTION_START_TOKEN_PREFIX).toBe('[[DOCX_INS_START:');
    expect(DOCX_INSERTION_END_TOKEN_PREFIX).toBe('[[DOCX_INS_END:');
    expect(DOCX_INSERTION_TOKEN_SUFFIX).toBe(']]');

    expect(DOCX_DELETION_START_TOKEN_PREFIX).toBe('[[DOCX_DEL_START:');
    expect(DOCX_DELETION_END_TOKEN_PREFIX).toBe('[[DOCX_DEL_END:');
    expect(DOCX_DELETION_TOKEN_SUFFIX).toBe(']]');

    expect(DOCX_COMMENT_START_TOKEN_PREFIX).toBe('[[DOCX_CMT_START:');
    expect(DOCX_COMMENT_END_TOKEN_PREFIX).toBe('[[DOCX_CMT_END:');
    expect(DOCX_COMMENT_TOKEN_SUFFIX).toBe(']]');
  });
});

describe('hasDocxTrackingTokens', () => {
  it('should return true for text with insertion tokens', () => {
    const html = `<p>${buildInsertionToken({ id: 'ins-1' }, 'start')}text${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>`;
    expect(hasDocxTrackingTokens(html)).toBe(true);
  });

  it('should return true for text with deletion tokens', () => {
    const html = `<p>${buildDeletionToken({ id: 'del-1' }, 'start')}text${buildDeletionToken({ id: 'del-1' }, 'end')}</p>`;
    expect(hasDocxTrackingTokens(html)).toBe(true);
  });

  it('should return true for text with comment tokens', () => {
    const html = `<p>${buildCommentToken({ id: 'cmt-1' }, 'start')}text${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>`;
    expect(hasDocxTrackingTokens(html)).toBe(true);
  });

  it('should return false for text without tokens', () => {
    const html = '<p>This is plain text without any tracking tokens</p>';
    expect(hasDocxTrackingTokens(html)).toBe(false);
  });

  it('should return false for empty text', () => {
    expect(hasDocxTrackingTokens('')).toBe(false);
  });

  it('should return true with only start token present', () => {
    const html = `<p>${buildInsertionToken({ id: 'ins-1' }, 'start')}text</p>`;
    expect(hasDocxTrackingTokens(html)).toBe(true);
  });
});

describe('parseDocxTrackedChanges', () => {
  describe('insertions', () => {
    it('should parse a single insertion', () => {
      const payload = { id: 'ins-1', author: 'John Doe', date: '2024-01-01' };
      const html = `<p>${buildInsertionToken(payload, 'start')}inserted text${buildInsertionToken(payload, 'end')}</p>`;

      const result = parseDocxTrackedChanges(html);

      expect(result.changes).toHaveLength(1);
      expect(result.insertionCount).toBe(1);
      expect(result.deletionCount).toBe(0);

      const change = result.changes[0];
      expect(change.id).toBe('ins-1');
      expect(change.type).toBe('insert');
      expect(change.author).toBe('John Doe');
      expect(change.date).toBe('2024-01-01');
      expect(change.startToken).toContain('[[DOCX_INS_START:');
      expect(change.endToken).toBe('[[DOCX_INS_END:ins-1]]');
    });

    it('should parse multiple insertions', () => {
      const html = `
        <p>${buildInsertionToken({ id: 'ins-1' }, 'start')}first${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>
        <p>${buildInsertionToken({ id: 'ins-2' }, 'start')}second${buildInsertionToken({ id: 'ins-2' }, 'end')}</p>
      `;

      const result = parseDocxTrackedChanges(html);

      expect(result.changes).toHaveLength(2);
      expect(result.insertionCount).toBe(2);
      expect(result.changes[0].id).toBe('ins-1');
      expect(result.changes[1].id).toBe('ins-2');
    });

    it('should handle insertion without author or date', () => {
      const html = `<p>${buildInsertionToken({ id: 'ins-1' }, 'start')}text${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>`;

      const result = parseDocxTrackedChanges(html);

      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].author).toBeUndefined();
      expect(result.changes[0].date).toBeUndefined();
    });
  });

  describe('deletions', () => {
    it('should parse a single deletion', () => {
      const payload = { id: 'del-1', author: 'Jane Smith', date: '2024-01-02' };
      const html = `<p>${buildDeletionToken(payload, 'start')}deleted text${buildDeletionToken(payload, 'end')}</p>`;

      const result = parseDocxTrackedChanges(html);

      expect(result.changes).toHaveLength(1);
      expect(result.deletionCount).toBe(1);
      expect(result.insertionCount).toBe(0);

      const change = result.changes[0];
      expect(change.id).toBe('del-1');
      expect(change.type).toBe('remove');
      expect(change.author).toBe('Jane Smith');
      expect(change.date).toBe('2024-01-02');
      expect(change.startToken).toContain('[[DOCX_DEL_START:');
      expect(change.endToken).toBe('[[DOCX_DEL_END:del-1]]');
    });

    it('should parse multiple deletions', () => {
      const html = `
        <p>${buildDeletionToken({ id: 'del-1' }, 'start')}first${buildDeletionToken({ id: 'del-1' }, 'end')}</p>
        <p>${buildDeletionToken({ id: 'del-2' }, 'start')}second${buildDeletionToken({ id: 'del-2' }, 'end')}</p>
      `;

      const result = parseDocxTrackedChanges(html);

      expect(result.changes).toHaveLength(2);
      expect(result.deletionCount).toBe(2);
    });
  });

  describe('mixed changes', () => {
    it('should parse insertions and deletions together', () => {
      const html = `
        <p>${buildInsertionToken({ id: 'ins-1', author: 'Alice' }, 'start')}added${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>
        <p>${buildDeletionToken({ id: 'del-1', author: 'Bob' }, 'start')}removed${buildDeletionToken({ id: 'del-1' }, 'end')}</p>
        <p>${buildInsertionToken({ id: 'ins-2', author: 'Alice' }, 'start')}added again${buildInsertionToken({ id: 'ins-2' }, 'end')}</p>
      `;

      const result = parseDocxTrackedChanges(html);

      expect(result.changes).toHaveLength(3);
      expect(result.insertionCount).toBe(2);
      expect(result.deletionCount).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should return empty result for text without tokens', () => {
      const result = parseDocxTrackedChanges('<p>plain text</p>');

      expect(result.changes).toHaveLength(0);
      expect(result.insertionCount).toBe(0);
      expect(result.deletionCount).toBe(0);
    });

    it('should return empty result for empty string', () => {
      const result = parseDocxTrackedChanges('');

      expect(result.changes).toHaveLength(0);
    });

    it('should skip malformed tokens', () => {
      const html =
        '<p>[[DOCX_INS_START:not-valid-json]]text[[DOCX_INS_END:id]]</p>';

      const result = parseDocxTrackedChanges(html);

      expect(result.changes).toHaveLength(0);
    });

    it('should skip tokens without id', () => {
      const encoded = encodeURIComponent(JSON.stringify({ author: 'John' }));
      const html = `<p>[[DOCX_INS_START:${encoded}]]text[[DOCX_INS_END:]]</p>`;

      const result = parseDocxTrackedChanges(html);

      expect(result.changes).toHaveLength(0);
    });

    it('should handle special characters in author name', () => {
      const payload = { id: 'ins-1', author: 'José García & Co. <test>' };
      const html = `<p>${buildInsertionToken(payload, 'start')}text${buildInsertionToken(payload, 'end')}</p>`;

      const result = parseDocxTrackedChanges(html);

      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].author).toBe('José García & Co. <test>');
    });

    it('should handle Unicode in author name', () => {
      const payload = { id: 'ins-1', author: '田中太郎' };
      const html = `<p>${buildInsertionToken(payload, 'start')}text${buildInsertionToken(payload, 'end')}</p>`;

      const result = parseDocxTrackedChanges(html);

      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].author).toBe('田中太郎');
    });
  });
});

describe('parseDocxComments', () => {
  describe('basic parsing', () => {
    it('should parse a single comment', () => {
      const payload = {
        id: 'cmt-1',
        authorName: 'John Doe',
        authorInitials: 'JD',
        date: '2024-01-01T10:00:00Z',
        text: 'This is a comment',
      };
      const html = `<p>${buildCommentToken(payload, 'start')}commented text${buildCommentToken(payload, 'end')}</p>`;

      const result = parseDocxComments(html);

      expect(result.comments).toHaveLength(1);
      expect(result.count).toBe(1);

      const comment = result.comments[0];
      expect(comment.id).toBe('cmt-1');
      expect(comment.authorName).toBe('John Doe');
      expect(comment.authorInitials).toBe('JD');
      expect(comment.date).toBe('2024-01-01T10:00:00Z');
      expect(comment.text).toBe('This is a comment');
      expect(comment.hasStartToken).toBe(true);
      expect(comment.hasEndToken).toBe(true);
    });

    it('should parse multiple comments', () => {
      const html = `
        <p>${buildCommentToken({ id: 'cmt-1', text: 'First' }, 'start')}text1${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>
        <p>${buildCommentToken({ id: 'cmt-2', text: 'Second' }, 'start')}text2${buildCommentToken({ id: 'cmt-2' }, 'end')}</p>
      `;

      const result = parseDocxComments(html);

      expect(result.comments).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.comments[0].text).toBe('First');
      expect(result.comments[1].text).toBe('Second');
    });
  });

  describe('partial tokens', () => {
    it('should handle comment with only start token', () => {
      const payload = { id: 'cmt-1', text: 'Point comment' };
      const html = `<p>${buildCommentToken(payload, 'start')}text</p>`;

      const result = parseDocxComments(html);

      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].hasStartToken).toBe(true);
      expect(result.comments[0].hasEndToken).toBe(false);
      expect(result.comments[0].text).toBe('Point comment');
    });

    it('should handle comment with only end token', () => {
      const html = `<p>text${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>`;

      const result = parseDocxComments(html);

      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].hasStartToken).toBe(false);
      expect(result.comments[0].hasEndToken).toBe(true);
    });

    it('should merge start and end tokens for same comment', () => {
      const payload = { id: 'cmt-1', authorName: 'John', text: 'Comment text' };
      const html = `<p>${buildCommentToken(payload, 'start')}text${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>`;

      const result = parseDocxComments(html);

      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].authorName).toBe('John');
      expect(result.comments[0].text).toBe('Comment text');
      expect(result.comments[0].hasStartToken).toBe(true);
      expect(result.comments[0].hasEndToken).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return empty result for text without tokens', () => {
      const result = parseDocxComments('<p>plain text</p>');

      expect(result.comments).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    it('should skip malformed tokens', () => {
      const html =
        '<p>[[DOCX_CMT_START:not-valid-json]]text[[DOCX_CMT_END:id]]</p>';

      const result = parseDocxComments(html);

      // End token still creates a comment (it's just an ID)
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].id).toBe('id');
    });

    it('should handle special characters in comment text', () => {
      const payload = {
        id: 'cmt-1',
        text: 'Comment with <tags> & special chars',
      };
      const html = `<p>${buildCommentToken(payload, 'start')}text${buildCommentToken(payload, 'end')}</p>`;

      const result = parseDocxComments(html);

      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].text).toBe(
        'Comment with <tags> & special chars'
      );
    });

    it('should handle Unicode in comment text', () => {
      const payload = {
        id: 'cmt-1',
        text: 'Comment with emoji 🎉 and CJK 日本語',
      };
      const html = `<p>${buildCommentToken(payload, 'start')}text${buildCommentToken(payload, 'end')}</p>`;

      const result = parseDocxComments(html);

      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].text).toBe(
        'Comment with emoji 🎉 and CJK 日本語'
      );
    });

    it('should handle empty comment text', () => {
      const payload = { id: 'cmt-1', authorName: 'John' };
      const html = `<p>${buildCommentToken(payload, 'start')}text${buildCommentToken(payload, 'end')}</p>`;

      const result = parseDocxComments(html);

      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].text).toBeUndefined();
    });
  });
});

describe('parseDocxTracking', () => {
  it('should parse both tracked changes and comments', () => {
    const html = `
      <p>${buildInsertionToken({ id: 'ins-1', author: 'Alice' }, 'start')}added${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>
      <p>${buildDeletionToken({ id: 'del-1', author: 'Bob' }, 'start')}removed${buildDeletionToken({ id: 'del-1' }, 'end')}</p>
      <p>${buildCommentToken({ id: 'cmt-1', text: 'Review this' }, 'start')}text${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>
    `;

    const result = parseDocxTracking(html);

    expect(result.hasTracking).toBe(true);
    expect(result.trackedChanges.insertionCount).toBe(1);
    expect(result.trackedChanges.deletionCount).toBe(1);
    expect(result.comments.count).toBe(1);
  });

  it('should return hasTracking false for plain text', () => {
    const result = parseDocxTracking('<p>plain text</p>');

    expect(result.hasTracking).toBe(false);
    expect(result.trackedChanges.changes).toHaveLength(0);
    expect(result.comments.comments).toHaveLength(0);
  });

  it('should set hasTracking true with only insertions', () => {
    const html = `<p>${buildInsertionToken({ id: 'ins-1' }, 'start')}text${buildInsertionToken({ id: 'ins-1' }, 'end')}</p>`;

    const result = parseDocxTracking(html);

    expect(result.hasTracking).toBe(true);
  });

  it('should set hasTracking true with only comments', () => {
    const html = `<p>${buildCommentToken({ id: 'cmt-1' }, 'start')}text${buildCommentToken({ id: 'cmt-1' }, 'end')}</p>`;

    const result = parseDocxTracking(html);

    expect(result.hasTracking).toBe(true);
  });
});

describe('stripDocxTrackingTokens', () => {
  it('should remove insertion tokens', () => {
    const html = `<p>before ${buildInsertionToken({ id: 'ins-1' }, 'start')}inserted${buildInsertionToken({ id: 'ins-1' }, 'end')} after</p>`;

    const result = stripDocxTrackingTokens(html);

    expect(result).toBe('<p>before inserted after</p>');
    expect(result).not.toContain('[[DOCX_');
  });

  it('should remove deletion tokens', () => {
    const html = `<p>before ${buildDeletionToken({ id: 'del-1' }, 'start')}deleted${buildDeletionToken({ id: 'del-1' }, 'end')} after</p>`;

    const result = stripDocxTrackingTokens(html);

    expect(result).toBe('<p>before deleted after</p>');
    expect(result).not.toContain('[[DOCX_');
  });

  it('should remove comment tokens', () => {
    const html = `<p>before ${buildCommentToken({ id: 'cmt-1', text: 'Comment' }, 'start')}commented${buildCommentToken({ id: 'cmt-1' }, 'end')} after</p>`;

    const result = stripDocxTrackingTokens(html);

    expect(result).toBe('<p>before commented after</p>');
    expect(result).not.toContain('[[DOCX_');
  });

  it('should remove all token types together', () => {
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

  it('should return unchanged text if no tokens', () => {
    const html = '<p>plain text</p>';

    const result = stripDocxTrackingTokens(html);

    expect(result).toBe(html);
  });

  it('should handle empty string', () => {
    expect(stripDocxTrackingTokens('')).toBe('');
  });
});
