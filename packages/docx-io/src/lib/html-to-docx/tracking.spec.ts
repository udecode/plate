/**
 * Unit tests for DOCX Tracked Changes and Comments Export Support.
 *
 * Tests the token-based tracking system for exporting Plate editor
 * suggestions and comments to Word's tracked changes and comments format.
 */

import { describe, expect, it, mock } from 'bun:test';
import JSZip from 'jszip';

import { htmlToDocxBlob } from '../exportDocx';
import {
  buildCommentEndToken,
  buildCommentStartToken,
  buildSuggestionEndToken,
  buildSuggestionStartToken,
  DOCX_COMMENT_END_TOKEN_PREFIX,
  DOCX_COMMENT_START_TOKEN_PREFIX,
  DOCX_COMMENT_TOKEN_SUFFIX,
  DOCX_DELETION_END_TOKEN_PREFIX,
  DOCX_DELETION_START_TOKEN_PREFIX,
  DOCX_DELETION_TOKEN_SUFFIX,
  DOCX_INSERTION_END_TOKEN_PREFIX,
  DOCX_INSERTION_START_TOKEN_PREFIX,
  DOCX_INSERTION_TOKEN_SUFFIX,
  hasTrackingTokens,
  splitDocxTrackingTokens,
} from './tracking';

// Helper to load zip from Blob
async function loadZipFromBlob(blob: Blob): Promise<JSZip> {
  const arrayBuffer = await blob.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
}

describe('Tracking Token Constants', () => {
  it('should have correct insertion token prefixes', () => {
    expect(DOCX_INSERTION_START_TOKEN_PREFIX).toBe('[[DOCX_INS_START:');
    expect(DOCX_INSERTION_END_TOKEN_PREFIX).toBe('[[DOCX_INS_END:');
    expect(DOCX_INSERTION_TOKEN_SUFFIX).toBe(']]');
  });

  it('should have correct deletion token prefixes', () => {
    expect(DOCX_DELETION_START_TOKEN_PREFIX).toBe('[[DOCX_DEL_START:');
    expect(DOCX_DELETION_END_TOKEN_PREFIX).toBe('[[DOCX_DEL_END:');
    expect(DOCX_DELETION_TOKEN_SUFFIX).toBe(']]');
  });

  it('should have correct comment token prefixes', () => {
    expect(DOCX_COMMENT_START_TOKEN_PREFIX).toBe('[[DOCX_CMT_START:');
    expect(DOCX_COMMENT_END_TOKEN_PREFIX).toBe('[[DOCX_CMT_END:');
    expect(DOCX_COMMENT_TOKEN_SUFFIX).toBe(']]');
  });
});

describe('hasTrackingTokens', () => {
  it('should return true for text with insertion tokens', () => {
    const text = '[[DOCX_INS_START:test]]inserted text[[DOCX_INS_END:test]]';
    expect(hasTrackingTokens(text)).toBe(true);
  });

  it('should return true for text with deletion tokens', () => {
    const text = '[[DOCX_DEL_START:test]]deleted text[[DOCX_DEL_END:test]]';
    expect(hasTrackingTokens(text)).toBe(true);
  });

  it('should return true for text with comment tokens', () => {
    const text = '[[DOCX_CMT_START:test]]commented text[[DOCX_CMT_END:test]]';
    expect(hasTrackingTokens(text)).toBe(true);
  });

  it('should return false for text without tokens', () => {
    const text = 'This is plain text without any tracking tokens';
    expect(hasTrackingTokens(text)).toBe(false);
  });

  it('should return false for empty text', () => {
    expect(hasTrackingTokens('')).toBe(false);
  });
});

describe('splitDocxTrackingTokens', () => {
  it('should return single text part for text without tokens', () => {
    const text = 'Plain text';
    const parts = splitDocxTrackingTokens(text);

    expect(parts).toHaveLength(1);
    expect(parts[0]).toEqual({ type: 'text', value: 'Plain text' });
  });

  it('should parse insertion start token', () => {
    const payload = encodeURIComponent(
      JSON.stringify({ id: 'ins-1', author: 'John', date: '2024-01-01' })
    );
    const text = `Before [[DOCX_INS_START:${payload}]]inserted[[DOCX_INS_END:ins-1]] after`;
    const parts = splitDocxTrackingTokens(text);

    expect(parts).toHaveLength(5);
    expect(parts[0]).toEqual({ type: 'text', value: 'Before ' });
    expect(parts[1]).toEqual({
      type: 'insStart',
      data: { id: 'ins-1', author: 'John', date: '2024-01-01' },
    });
    expect(parts[2]).toEqual({ type: 'text', value: 'inserted' });
    expect(parts[3]).toEqual({ type: 'insEnd', id: 'ins-1' });
    expect(parts[4]).toEqual({ type: 'text', value: ' after' });
  });

  it('should parse deletion tokens', () => {
    const payload = encodeURIComponent(
      JSON.stringify({ id: 'del-1', author: 'Jane' })
    );
    const text = `[[DOCX_DEL_START:${payload}]]deleted[[DOCX_DEL_END:del-1]]`;
    const parts = splitDocxTrackingTokens(text);

    expect(parts).toHaveLength(3);
    expect(parts[0]).toEqual({
      type: 'delStart',
      data: { id: 'del-1', author: 'Jane' },
    });
    expect(parts[1]).toEqual({ type: 'text', value: 'deleted' });
    expect(parts[2]).toEqual({ type: 'delEnd', id: 'del-1' });
  });

  it('should parse comment tokens', () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        id: 'cmt-1',
        authorName: 'Bob',
        authorInitials: 'B',
        text: 'This is a comment',
      })
    );
    const text = `[[DOCX_CMT_START:${payload}]]commented[[DOCX_CMT_END:cmt-1]]`;
    const parts = splitDocxTrackingTokens(text);

    expect(parts).toHaveLength(3);
    expect(parts[0]).toEqual({
      type: 'commentStart',
      data: {
        id: 'cmt-1',
        authorName: 'Bob',
        authorInitials: 'B',
        text: 'This is a comment',
      },
    });
    expect(parts[1]).toEqual({ type: 'text', value: 'commented' });
    expect(parts[2]).toEqual({ type: 'commentEnd', id: 'cmt-1' });
  });

  it('should handle nested tokens', () => {
    const insPayload = encodeURIComponent(JSON.stringify({ id: 'ins-1' }));
    const cmtPayload = encodeURIComponent(
      JSON.stringify({ id: 'cmt-1', text: 'Comment' })
    );
    const text = `[[DOCX_INS_START:${insPayload}]][[DOCX_CMT_START:${cmtPayload}]]nested[[DOCX_CMT_END:cmt-1]][[DOCX_INS_END:ins-1]]`;
    const parts = splitDocxTrackingTokens(text);

    expect(parts).toHaveLength(5);
    expect(parts[0].type).toBe('insStart');
    expect(parts[1].type).toBe('commentStart');
    expect(parts[2]).toEqual({ type: 'text', value: 'nested' });
    expect(parts[3].type).toBe('commentEnd');
    expect(parts[4].type).toBe('insEnd');
  });

  it('should handle malformed tokens as text', () => {
    const text = '[[DOCX_INS_START:invalid-not-json]]text[[DOCX_INS_END:id]]';
    const parts = splitDocxTrackingTokens(text);

    // The malformed start token should be treated as text
    expect(parts.length).toBeGreaterThan(0);
    expect(parts.some((p) => p.type === 'text')).toBe(true);
  });
});

describe('Token Building Functions', () => {
  describe('buildSuggestionStartToken', () => {
    it('should build insertion start token', () => {
      const payload = { id: 'ins-1', author: 'John', date: '2024-01-01' };
      const token = buildSuggestionStartToken(payload, 'insert');

      expect(token).toContain('[[DOCX_INS_START:');
      expect(token).toContain(']]');

      // Should be parseable
      const parts = splitDocxTrackingTokens(token);
      expect(parts).toHaveLength(1);
      expect(parts[0].type).toBe('insStart');
    });

    it('should build deletion start token', () => {
      const payload = { id: 'del-1', author: 'Jane' };
      const token = buildSuggestionStartToken(payload, 'remove');

      expect(token).toContain('[[DOCX_DEL_START:');
      expect(token).toContain(']]');

      const parts = splitDocxTrackingTokens(token);
      expect(parts).toHaveLength(1);
      expect(parts[0].type).toBe('delStart');
    });
  });

  describe('buildSuggestionEndToken', () => {
    it('should build insertion end token', () => {
      const token = buildSuggestionEndToken('ins-1', 'insert');

      expect(token).toBe('[[DOCX_INS_END:ins-1]]');

      const parts = splitDocxTrackingTokens(token);
      expect(parts).toHaveLength(1);
      expect(parts[0]).toEqual({ type: 'insEnd', id: 'ins-1' });
    });

    it('should build deletion end token', () => {
      const token = buildSuggestionEndToken('del-1', 'remove');

      expect(token).toBe('[[DOCX_DEL_END:del-1]]');

      const parts = splitDocxTrackingTokens(token);
      expect(parts).toHaveLength(1);
      expect(parts[0]).toEqual({ type: 'delEnd', id: 'del-1' });
    });
  });

  describe('buildCommentStartToken', () => {
    it('should build comment start token with full payload', () => {
      const payload = {
        id: 'cmt-1',
        authorName: 'John Doe',
        authorInitials: 'JD',
        date: '2024-01-01T10:00:00Z',
        text: 'This is a comment',
      };
      const token = buildCommentStartToken(payload);

      expect(token).toContain('[[DOCX_CMT_START:');
      expect(token).toContain(']]');

      const parts = splitDocxTrackingTokens(token);
      expect(parts).toHaveLength(1);
      expect(parts[0].type).toBe('commentStart');
      if (parts[0].type === 'commentStart') {
        expect(parts[0].data.id).toBe('cmt-1');
        expect(parts[0].data.authorName).toBe('John Doe');
        expect(parts[0].data.text).toBe('This is a comment');
      }
    });
  });

  describe('buildCommentEndToken', () => {
    it('should build comment end token', () => {
      const token = buildCommentEndToken('cmt-1');

      expect(token).toBe('[[DOCX_CMT_END:cmt-1]]');

      const parts = splitDocxTrackingTokens(token);
      expect(parts).toHaveLength(1);
      expect(parts[0]).toEqual({ type: 'commentEnd', id: 'cmt-1' });
    });
  });
});

describe('DOCX Export with Tracked Changes', () => {
  it('should export insertion tokens as w:ins elements', async () => {
    const startPayload = encodeURIComponent(
      JSON.stringify({ id: 'ins-1', author: 'John Doe', date: '2024-01-01' })
    );
    const html = `<p>Normal text [[DOCX_INS_START:${startPayload}]]inserted text[[DOCX_INS_END:ins-1]] more text</p>`;

    const result = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(result);
    const docXml = await zip.file('word/document.xml')!.async('string');

    // Should contain w:ins element
    expect(docXml).toContain('<w:ins');
    expect(docXml).toContain('w:author="John Doe"');
    expect(docXml).toContain('inserted text');
  });

  it('should export deletion tokens as w:del elements with w:delText', async () => {
    const startPayload = encodeURIComponent(
      JSON.stringify({ id: 'del-1', author: 'Jane Smith', date: '2024-01-02' })
    );
    const html = `<p>Normal text [[DOCX_DEL_START:${startPayload}]]deleted text[[DOCX_DEL_END:del-1]] more text</p>`;

    const result = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(result);
    const docXml = await zip.file('word/document.xml')!.async('string');

    // Should contain w:del element
    expect(docXml).toContain('<w:del');
    expect(docXml).toContain('w:author="Jane Smith"');
    // Deleted text should use w:delText element
    expect(docXml).toContain('<w:delText');
    expect(docXml).toContain('deleted text');
  });

  it('should export comment tokens with comment markers and comments.xml', async () => {
    const startPayload = encodeURIComponent(
      JSON.stringify({
        id: 'cmt-1',
        authorName: 'Bob Wilson',
        authorInitials: 'BW',
        date: '2024-01-03T10:00:00Z',
        text: 'This needs review',
      })
    );
    const html = `<p>Normal text [[DOCX_CMT_START:${startPayload}]]commented text[[DOCX_CMT_END:cmt-1]] more text</p>`;

    const result = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(result);
    const docXml = await zip.file('word/document.xml')!.async('string');

    // Document should contain comment markers
    expect(docXml).toContain('<w:commentRangeStart');
    expect(docXml).toContain('<w:commentRangeEnd');
    expect(docXml).toContain('<w:commentReference');

    // Should have comments.xml file
    const commentsFile = zip.file('word/comments.xml');
    expect(commentsFile).not.toBeNull();

    if (commentsFile) {
      const commentsXml = await commentsFile.async('string');
      // Check for comment element (with or without namespace prefix)
      expect(
        commentsXml.includes('<w:comment') || commentsXml.includes('<comment')
      ).toBe(true);
      // Check for author attribute (with or without namespace prefix)
      expect(
        commentsXml.includes('w:author="Bob Wilson"') ||
          commentsXml.includes('author="Bob Wilson"') ||
          commentsXml.includes(':author="Bob Wilson"')
      ).toBe(true);
      // Check for initials attribute
      expect(
        commentsXml.includes('w:initials="BW"') ||
          commentsXml.includes('initials="BW"') ||
          commentsXml.includes(':initials="BW"')
      ).toBe(true);
      expect(commentsXml).toContain('This needs review');
    }

    // Content types should include comments
    const contentTypes = await zip.file('[Content_Types].xml')!.async('string');
    expect(contentTypes).toContain('comments.xml');
  });

  it('should handle multiple tracked changes in same paragraph', async () => {
    const ins1 = encodeURIComponent(JSON.stringify({ id: 'ins-1' }));
    const del1 = encodeURIComponent(JSON.stringify({ id: 'del-1' }));
    const html = `<p>Start [[DOCX_INS_START:${ins1}]]inserted[[DOCX_INS_END:ins-1]] middle [[DOCX_DEL_START:${del1}]]deleted[[DOCX_DEL_END:del-1]] end</p>`;

    const result = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(result);
    const docXml = await zip.file('word/document.xml')!.async('string');

    expect(docXml).toContain('<w:ins');
    expect(docXml).toContain('<w:del');
    expect(docXml).toContain('inserted');
    expect(docXml).toContain('deleted');
  });

  it('should not create comments.xml when no comments exist', async () => {
    const html = '<p>Plain text without comments</p>';

    const result = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(result);

    const commentsFile = zip.file('word/comments.xml');
    expect(commentsFile).toBeNull();
  });

  it('warns when dead tracking tokens remain in document.xml', async () => {
    const warn = mock((..._args: unknown[]) => {});
    const originalWarn = console.warn;
    console.warn = (...args: any[]) =>
      (warn as unknown as (...callArgs: any[]) => void)(...args);

    try {
      const html = '<p>[[DOCX_INS_START:invalid]]text</p>';
      await htmlToDocxBlob(html);
    } finally {
      console.warn = originalWarn;
    }

    expect(warn).toHaveBeenCalled();
    const firstCall = warn.mock.calls[0];
    expect(firstCall?.[0]).toContain('dead tracking tokens in document.xml');
  });
});

describe('Round-trip Token Encoding', () => {
  it('should correctly encode and decode special characters in author names', () => {
    const payload = {
      id: 'test-1',
      author: 'José García & Maria <test>',
    };
    const token = buildSuggestionStartToken(payload, 'insert');
    const parts = splitDocxTrackingTokens(token);

    expect(parts).toHaveLength(1);
    expect(parts[0].type).toBe('insStart');
    if (parts[0].type === 'insStart') {
      expect(parts[0].data.author).toBe('José García & Maria <test>');
    }
  });

  it('should correctly encode and decode Unicode in comment text', () => {
    const payload = {
      id: 'cmt-1',
      authorName: '田中太郎',
      text: 'Comment with emoji 🎉 and CJK 日本語',
    };
    const token = buildCommentStartToken(payload);
    const parts = splitDocxTrackingTokens(token);

    expect(parts).toHaveLength(1);
    expect(parts[0].type).toBe('commentStart');
    if (parts[0].type === 'commentStart') {
      expect(parts[0].data.authorName).toBe('田中太郎');
      expect(parts[0].data.text).toBe('Comment with emoji 🎉 and CJK 日本語');
    }
  });
});
