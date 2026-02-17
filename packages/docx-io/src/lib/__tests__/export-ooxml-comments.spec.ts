/**
 * Tests for OOXML comment XML generation via htmlToDocxBlob.
 *
 * Verifies that:
 * - Comments produce valid comments.xml with correct authors
 * - Reply threading produces commentsExtended.xml with parentParaId
 * - Multiple discussions don't collide in the OOXML output
 * - paraId values are unique across all comments
 */

import { describe, expect, it } from 'bun:test';
import JSZip from 'jszip';

import { htmlToDocxBlob } from '../exportDocx';
import {
  buildCommentStartToken,
  buildCommentEndToken,
} from '../html-to-docx/tracking';

async function loadZipFromBlob(blob: Blob): Promise<JSZip> {
  const arrayBuffer = await blob.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
}

async function getXmlFromZip(zip: JSZip, path: string): Promise<string | null> {
  const file = zip.file(path);
  if (!file) return null;
  return file.async('text');
}

describe('OOXML comment generation', () => {
  it('should produce comments.xml with correct author names', async () => {
    const payload = {
      id: 'discussion1',
      authorName: 'Alice',
      authorInitials: 'A',
      date: '2025-01-15T10:00:00.000Z',
      text: 'Great work!',
    };

    const token = buildCommentStartToken(payload);
    const html = `<p>${token}annotated text${buildCommentEndToken('discussion1')}</p>`;

    const blob = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(blob);
    const commentsXml = await getXmlFromZip(zip, 'word/comments.xml');

    expect(commentsXml).not.toBeNull();
    // Author should be "Alice", not "unknown"
    expect(commentsXml).toContain('author="Alice"');
    expect(commentsXml).toContain('initials="A"');
  });

  it('should preserve distinct authors for two discussions', async () => {
    const d1 = {
      id: 'discussion1',
      authorName: 'Alice',
      authorInitials: 'A',
      date: '2025-01-15T10:00:00.000Z',
      text: 'Comment from Alice',
    };

    const d2 = {
      id: 'discussion2',
      authorName: 'Bob',
      authorInitials: 'B',
      date: '2025-01-15T11:00:00.000Z',
      text: 'Comment from Bob',
    };

    const html = `
      <p>
        ${buildCommentStartToken(d1)}text one${buildCommentEndToken('discussion1')}
        ${buildCommentStartToken(d2)}text two${buildCommentEndToken('discussion2')}
      </p>
    `;

    const blob = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(blob);
    const commentsXml = await getXmlFromZip(zip, 'word/comments.xml');

    expect(commentsXml).not.toBeNull();
    expect(commentsXml).toContain('author="Alice"');
    expect(commentsXml).toContain('author="Bob"');
  });

  it('should thread replies via commentsExtended.xml', async () => {
    const payload = {
      id: 'discussion1',
      authorName: 'Alice',
      authorInitials: 'A',
      date: '2025-01-15T10:00:00.000Z',
      text: 'Root comment',
      replies: [
        {
          id: 'reply1',
          authorName: 'Bob',
          authorInitials: 'B',
          date: '2025-01-15T11:00:00.000Z',
          text: 'Reply from Bob',
        },
      ],
    };

    const html = `<p>${buildCommentStartToken(payload)}annotated${buildCommentEndToken('discussion1')}</p>`;

    const blob = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(blob);

    const commentsXml = await getXmlFromZip(zip, 'word/comments.xml');
    const extendedXml = await getXmlFromZip(zip, 'word/commentsExtended.xml');

    expect(commentsXml).not.toBeNull();
    // Both authors present
    expect(commentsXml).toContain('author="Alice"');
    expect(commentsXml).toContain('author="Bob"');

    // commentsExtended should exist with threading
    expect(extendedXml).not.toBeNull();
    // Should contain paraIdParent for the reply
    expect(extendedXml).toContain('paraIdParent');
  });

  it('should produce unique paraIds for all comments', async () => {
    const d1 = {
      id: 'disc1',
      authorName: 'Alice',
      authorInitials: 'A',
      text: 'Comment 1',
      replies: [{ id: 'r1', authorName: 'Bob', text: 'Reply 1' }],
    };

    const d2 = {
      id: 'disc2',
      authorName: 'Charlie',
      authorInitials: 'C',
      text: 'Comment 2',
    };

    const html = `
      <p>
        ${buildCommentStartToken(d1)}first${buildCommentEndToken('disc1')}
        ${buildCommentStartToken(d2)}second${buildCommentEndToken('disc2')}
      </p>
    `;

    const blob = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(blob);
    const commentsXml = await getXmlFromZip(zip, 'word/comments.xml');

    expect(commentsXml).not.toBeNull();

    // Extract all paraId values from comments.xml
    const paraIdMatches = commentsXml!.match(/paraId="([^"]+)"/g);
    expect(paraIdMatches).not.toBeNull();
    expect(paraIdMatches!.length).toBeGreaterThanOrEqual(3); // 2 roots + 1 reply

    // All paraIds must be unique
    const paraIds = paraIdMatches!.map((m) => m.replace(/paraId="|"/g, ''));
    const uniqueParaIds = new Set(paraIds);
    expect(uniqueParaIds.size).toBe(paraIds.length);
  });

  it('should not produce "unknown" author when author is provided', async () => {
    const payload = {
      id: 'disc1',
      authorName: 'Charlie',
      authorInitials: 'C',
      date: '2025-01-15T10:00:00.000Z',
      text: 'Named comment',
    };

    const html = `<p>${buildCommentStartToken(payload)}text${buildCommentEndToken('disc1')}</p>`;

    const blob = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(blob);
    const commentsXml = await getXmlFromZip(zip, 'word/comments.xml');

    expect(commentsXml).not.toBeNull();
    expect(commentsXml).toContain('author="Charlie"');
    // "unknown" should not appear when author is explicitly provided
    expect(commentsXml).not.toContain('author="unknown"');
  });
});
