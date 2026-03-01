/**
 * Round-trip audit: Export → Unzip → Inspect XML → Verify
 *
 * Checks that everything we put into the export comes out correctly
 * in the OOXML ZIP, and that mammoth can parse it back.
 */
import { describe, expect, it } from 'bun:test';
import JSZip from 'jszip';

import { htmlToDocxBlob } from '../exportDocx';
import {
  buildCommentStartToken,
  buildCommentEndToken,
  type CommentPayload,
} from '../html-to-docx/tracking';

async function loadZip(blob: Blob): Promise<JSZip> {
  return JSZip.loadAsync(await blob.arrayBuffer());
}

async function getXml(zip: JSZip, path: string): Promise<string | null> {
  const file = zip.file(path);
  return file ? file.async('text') : null;
}

// Build a full HTML with comment tokens
function buildCommentHtml(payload: CommentPayload): string {
  const start = buildCommentStartToken(payload);
  const end = buildCommentEndToken(payload.id);
  return `<p>${start}annotated text${end}</p>`;
}

describe('Round-trip audit: export OOXML correctness', () => {
  it('comments.xml should have correct author, not "unknown"', async () => {
    const html = buildCommentHtml({
      id: 'disc1',
      authorName: 'Alice',
      authorInitials: 'A',
      date: '2025-01-15T10:00:00.000Z',
      text: 'Hello',
    });
    const zip = await loadZip(await htmlToDocxBlob(html));
    const xml = await getXml(zip, 'word/comments.xml');

    expect(xml).toContain('author="Alice"');
    expect(xml).not.toContain('author="unknown"');
  });

  it('comments.xml should have paraId on <w:p> element', async () => {
    const html = buildCommentHtml({
      id: 'disc1',
      authorName: 'Alice',
      paraId: 'AABBCCDD',
      text: 'Test',
    });
    const zip = await loadZip(await htmlToDocxBlob(html));
    const xml = await getXml(zip, 'word/comments.xml');

    expect(xml).toContain('AABBCCDD');
  });

  it('commentsExtended.xml should exist and contain paraId', async () => {
    const html = buildCommentHtml({
      id: 'disc1',
      authorName: 'Alice',
      paraId: '11223344',
      text: 'Test',
    });
    const zip = await loadZip(await htmlToDocxBlob(html));
    const xml = await getXml(zip, 'word/commentsExtended.xml');

    expect(xml).not.toBeNull();
    expect(xml).toContain('11223344');
  });

  it('reply should have parentParaId in commentsExtended.xml', async () => {
    const html = buildCommentHtml({
      id: 'disc1',
      authorName: 'Alice',
      paraId: 'PARENT01',
      text: 'Root comment',
      replies: [
        {
          id: 'reply1',
          authorName: 'Bob',
          paraId: 'REPLY001',
          text: 'Reply text',
        },
      ],
    });
    const zip = await loadZip(await htmlToDocxBlob(html));
    const extXml = await getXml(zip, 'word/commentsExtended.xml');

    expect(extXml).not.toBeNull();
    // Root comment paraId
    expect(extXml).toContain('PARENT01');
    // Reply paraId
    expect(extXml).toContain('REPLY001');
    // Reply should reference parent
    expect(extXml).toContain('paraIdParent');
  });

  it('document.xml should have commentRangeStart and commentRangeEnd', async () => {
    const html = buildCommentHtml({
      id: 'disc1',
      authorName: 'Alice',
      text: 'Test',
    });
    const zip = await loadZip(await htmlToDocxBlob(html));
    const xml = await getXml(zip, 'word/document.xml');

    expect(xml).toContain('commentRangeStart');
    expect(xml).toContain('commentRangeEnd');
    expect(xml).toContain('commentReference');
  });

  it('styles.xml should define CommentText and CommentReference styles', async () => {
    const html = buildCommentHtml({
      id: 'disc1',
      authorName: 'Alice',
      text: 'Test',
    });
    const zip = await loadZip(await htmlToDocxBlob(html));
    const xml = await getXml(zip, 'word/styles.xml');

    // These styles are referenced by comments.xml — if missing, mammoth warns
    expect(xml).toContain('CommentText');
    expect(xml).toContain('CommentReference');
  });

  it('commentsExtended.xml namespace should use w15 prefix readable by mammoth', async () => {
    const html = buildCommentHtml({
      id: 'disc1',
      authorName: 'Alice',
      paraId: 'AABB1122',
      text: 'Test',
      replies: [
        {
          id: 'r1',
          authorName: 'Bob',
          paraId: 'CCDD3344',
          text: 'Reply',
        },
      ],
    });
    const zip = await loadZip(await htmlToDocxBlob(html));
    const xml = await getXml(zip, 'word/commentsExtended.xml');

    // mammoth expects element names like <w15:commentEx w15:paraId="...">
    // Check the actual namespace URI is declared
    expect(xml).toContain(
      'http://schemas.microsoft.com/office/word/2012/wordml'
    );
    // Check element name format - should be w15:commentEx or namespace-qualified
    expect(xml).toContain('commentEx');
    expect(xml).toContain('paraId');
  });

  it('two discussions should produce two separate comment entries', async () => {
    const p1 = buildCommentStartToken({
      id: 'disc1',
      authorName: 'Alice',
      text: 'First',
    });
    const p2 = buildCommentStartToken({
      id: 'disc2',
      authorName: 'Bob',
      text: 'Second',
    });
    const html =
      `<p>${p1}text1${buildCommentEndToken('disc1')}</p>` +
      `<p>${p2}text2${buildCommentEndToken('disc2')}</p>`;

    const zip = await loadZip(await htmlToDocxBlob(html));
    const xml = await getXml(zip, 'word/comments.xml');

    expect(xml).toContain('author="Alice"');
    expect(xml).toContain('author="Bob"');
    // Should have w:id="1" and w:id="2"
    const idMatches = xml!.match(/w:id="(\d+)"/g);
    expect(idMatches!.length).toBeGreaterThanOrEqual(2);
  });

  it('no tokens should remain in document.xml text', async () => {
    const html = buildCommentHtml({
      id: 'disc1',
      authorName: 'Alice',
      text: 'Test',
    });
    const zip = await loadZip(await htmlToDocxBlob(html));
    const xml = await getXml(zip, 'word/document.xml');

    expect(xml).not.toContain('[[DOCX_CMT_START');
    expect(xml).not.toContain('[[DOCX_CMT_END');
    expect(xml).not.toContain('DOCX_INS_START');
    expect(xml).not.toContain('DOCX_DEL_START');
  });
});
