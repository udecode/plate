/**
 * Tests for resolveCommentMeta() reply ID handling.
 */

import { describe, expect, it } from 'bun:test';

import type { TNode } from 'platejs';

import type { DocxExportDiscussion } from '../exportTrackChanges';
import { injectDocxTrackingTokens } from '../exportTrackChanges';
import type { CommentPayload } from '../html-to-docx/tracking';
import { splitDocxTrackingTokens } from '../html-to-docx/tracking';

/** Extract the first CommentPayload from injected token text */
function extractCommentPayload(
  discussionId: string,
  discussions: DocxExportDiscussion[]
): CommentPayload | undefined {
  const value: TNode[] = [
    {
      type: 'p',
      children: [
        {
          text: 'Hello world',
          [`comment_${discussionId}`]: true,
        },
      ],
    },
  ];

  const result = injectDocxTrackingTokens(value, { discussions });
  const injectedText = (
    (result[0] as Record<string, unknown>).children as Record<string, unknown>[]
  )[0].text as string;

  const tokens = splitDocxTrackingTokens(injectedText);
  const commentStart = tokens.find((t) => t.type === 'commentStart');

  if (commentStart && commentStart.type === 'commentStart') {
    return commentStart.data;
  }

  return;
}

describe('resolveCommentMeta with reply IDs', () => {
  it('should include IDs in replies', () => {
    const discussionId = 'disc-001';

    const discussions: DocxExportDiscussion[] = [
      {
        id: discussionId,
        comments: [
          {
            contentRich: [
              { type: 'p', children: [{ text: 'Parent comment text' }] },
            ],
            createdAt: '2025-01-15T10:00:00.000Z',
            user: { id: 'user-1', name: 'Alice Author' },
            userId: 'user-1',
            // Parent doesn't need explicit ID in this structure as discussion.id is used
          },
          {
            id: 'reply-1', // ID we want to preserve
            contentRich: [
              { type: 'p', children: [{ text: 'First reply text' }] },
            ],
            createdAt: '2025-01-15T11:00:00.000Z',
            user: { id: 'user-2', name: 'Bob Reviewer' },
            userId: 'user-2',
          },
        ],
        createdAt: '2025-01-15T10:00:00.000Z',
        documentContent: 'Parent comment text',
        user: { id: 'user-1', name: 'Alice Author' },
        userId: 'user-1',
      },
    ];

    const payload = extractCommentPayload(discussionId, discussions);

    expect(payload).toBeDefined();
    expect(payload!.replies).toBeDefined();
    expect(payload!.replies).toHaveLength(1);

    // This check is expected to fail initially because 'id' is not passed through
    expect(payload!.replies![0]!.id).toBe('reply-1');
  });

  it('should generate IDs for replies when missing', () => {
    const discussionId = 'disc-002';

    const discussions: DocxExportDiscussion[] = [
      {
        id: discussionId,
        comments: [
          {
            contentRich: [
              { type: 'p', children: [{ text: 'Parent comment text' }] },
            ],
            createdAt: '2025-01-15T10:00:00.000Z',
            user: { id: 'user-1', name: 'Alice Author' },
            userId: 'user-1',
          },
          {
            // Missing ID, should be generated
            contentRich: [
              { type: 'p', children: [{ text: 'Reply without ID' }] },
            ],
            createdAt: '2025-01-15T11:00:00.000Z',
            user: { id: 'user-2', name: 'Bob Reviewer' },
            userId: 'user-2',
          },
        ],
        createdAt: '2025-01-15T10:00:00.000Z',
        documentContent: 'Parent comment text',
        user: { id: 'user-1', name: 'Alice Author' },
        userId: 'user-1',
      },
    ];

    const payload = extractCommentPayload(discussionId, discussions);

    expect(payload).toBeDefined();
    expect(payload!.replies).toBeDefined();
    expect(payload!.replies).toHaveLength(1);

    const replyId = payload!.replies![0]!.id;
    expect(replyId).toBeDefined();
    expect(typeof replyId).toBe('string');
    expect(replyId.length).toBeGreaterThan(0);
  });
});
