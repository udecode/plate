import { describe, expect, it } from 'bun:test';
import JSZip from 'jszip';
import { htmlToDocxBlob } from '../exportDocx';
import { buildCommentStartToken } from '../html-to-docx/tracking';

async function loadZipFromBlob(blob: Blob): Promise<JSZip> {
  const arrayBuffer = await blob.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
}

describe('XML Builder Regression Tests', () => {
  it('should handle falsy but valid IDs (empty string) for replies without overriding them', async () => {
    // Construct a comment payload where a reply has an empty string ID
    const payload = {
      id: 'cmt-1',
      authorName: 'Test User',
      text: 'Parent',
      replies: [
        {
          id: '', // Empty string ID (falsy)
          authorName: 'Reply User',
          text: 'Reply with empty ID',
        },
      ],
    };

    // We expect the XML builder to use "" as the ID, not "cmt-1-reply-0"
    // And subsequently track it and close it properly.

    const token = buildCommentStartToken(payload);
    const html = `<p>Text ${token}Commented${'[[DOCX_CMT_END:cmt-1]]'}</p>`;

    const blob = await htmlToDocxBlob(html);
    const zip = await loadZipFromBlob(blob);

    // Check comments.xml to see if a comment was created for the reply
    const commentsXml = await zip.file('word/comments.xml')!.async('string');

    // There should be 2 comments: parent and reply.
    // The reply should have the text "Reply with empty ID"
    expect(commentsXml).toContain('Reply with empty ID');

    // Check document.xml to ensure ranges are closed
    const docXml = await zip.file('word/document.xml')!.async('string');

    // We expect 2 pairs of commentRangeStart/End
    // Counting them is a rough check
    const startCount = (docXml.match(/<w:commentRangeStart/g) || []).length;
    const endCount = (docXml.match(/<w:commentRangeEnd/g) || []).length;

    expect(startCount).toBe(2);
    expect(endCount).toBe(2);
  });
});
