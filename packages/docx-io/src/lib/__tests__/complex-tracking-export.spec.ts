import { describe, expect, it } from 'bun:test';
import { htmlToDocxBlob } from '../exportDocx';
import {
  buildCommentStartToken,
  buildSuggestionStartToken,
} from '../html-to-docx/tracking';

describe('Crash Reproduction: Overlapping and Duplicate IDs', () => {
  it('should not crash when exporting overlapping comments/suggestions and duplicate reply IDs', async () => {
    // 1. Construct Payloads
    const discussion1Payload = {
      id: 'discussion1',
      authorName: 'Charlie',
      authorInitials: 'C',
      date: '2026-02-06T11:55:06.789Z',
      text: 'Comments are a great way to provide feedback and discuss changes.',
      replies: [
        {
          id: 'comment2', // Duplicate ID
          authorName: 'Bob',
          authorInitials: 'B',
          date: '2026-02-06T11:56:46.789Z',
          text: 'Agreed! The link to the docs makes it easy to learn more.',
        },
      ],
    };

    const discussion2Payload = {
      id: 'discussion2',
      authorName: 'Bob',
      authorInitials: 'B',
      date: '2026-02-06T12:00:06.789Z',
      text: 'Nice demonstration of overlapping annotations with both comments and suggestions!',
      replies: [
        {
          id: 'comment2', // Duplicate ID reused here
          authorName: 'Charlie',
          authorInitials: 'C',
          date: '2026-02-06T12:01:46.789Z',
          text: 'This helps users understand how powerful the editor can be.',
        },
      ],
    };

    const suggestionPayload = {
      id: 'playground3',
      type: 'insert',
      author: 'charlie',
      date: '1770379506741',
    };

    // 2. Construct Tokens
    const d1Start = buildCommentStartToken(discussion1Payload);
    const d2Start = buildCommentStartToken(discussion2Payload);
    const sStart = buildSuggestionStartToken(suggestionPayload, 'insert');

    // 3. Construct HTML
    // Simulating:
    // <p>
    //   <a href="...">[d1]comments[/d1]</a>
    //   [d1] on many text segments[/d1]. You can even have
    //   [s][d2]overlapping[/d2][/s] annotations!
    // </p>
    const html = `
      <p>
        Review and refine content seamlessly. Use
        <a href="/docs/comment">
          ${d1Start}comments[[DOCX_CMT_END:discussion1]]
        </a>
        ${d1Start} on many text segments[[DOCX_CMT_END:discussion1]].
        You can even have
        ${sStart}${d2Start}overlapping[[DOCX_CMT_END:discussion2]][[DOCX_INS_END:playground3]]
        annotations!
      </p>
    `;

    // 4. Run Export
    try {
      const blob = await htmlToDocxBlob(html);
      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  });
});
