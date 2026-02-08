/**
 * Tests for resolveCommentMeta() reply handling.
 *
 * resolveCommentMeta is private, so we test through the public API:
 *   injectDocxTrackingTokens -> token text -> splitDocxTrackingTokens
 *
 * These tests should FAIL until Phase 3 implementation populates replies.
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

describe('resolveCommentMeta with replies', () => {
  it('should include replies array from multi-comment discussion', () => {
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
          },
          {
            contentRich: [
              { type: 'p', children: [{ text: 'First reply text' }] },
            ],
            createdAt: '2025-01-15T11:00:00.000Z',
            user: { id: 'user-2', name: 'Bob Reviewer' },
            userId: 'user-2',
          },
          {
            contentRich: [
              { type: 'p', children: [{ text: 'Second reply text' }] },
            ],
            createdAt: '2025-01-15T12:00:00.000Z',
            user: { id: 'user-3', name: 'Carol Editor' },
            userId: 'user-3',
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
    expect(payload!.id).toBe(discussionId);

    // Parent metadata
    expect(payload!.authorName).toBe('Alice Author');
    expect(payload!.date).toBe('2025-01-15T10:00:00.000Z');

    // Replies - this WILL FAIL until resolveCommentMeta populates replies
    expect(payload!.replies).toBeDefined();
    expect(payload!.replies).toHaveLength(2);

    // First reply
    expect(payload!.replies![0].authorName).toBe('Bob Reviewer');
    expect(payload!.replies![0].text).toBe('First reply text');
    expect(payload!.replies![0].date).toBe('2025-01-15T11:00:00.000Z');

    // Second reply
    expect(payload!.replies![1].authorName).toBe('Carol Editor');
    expect(payload!.replies![1].text).toBe('Second reply text');
    expect(payload!.replies![1].date).toBe('2025-01-15T12:00:00.000Z');
  });

  it('should return empty replies for single-comment discussion', () => {
    const discussionId = 'disc-002';

    const discussions: DocxExportDiscussion[] = [
      {
        id: discussionId,
        comments: [
          {
            contentRich: [{ type: 'p', children: [{ text: 'Only comment' }] }],
            createdAt: '2025-01-15T10:00:00.000Z',
            user: { id: 'user-1', name: 'Alice Author' },
            userId: 'user-1',
          },
        ],
        createdAt: '2025-01-15T10:00:00.000Z',
        documentContent: 'Only comment',
        user: { id: 'user-1', name: 'Alice Author' },
        userId: 'user-1',
      },
    ];

    const payload = extractCommentPayload(discussionId, discussions);

    expect(payload).toBeDefined();
    expect(payload!.id).toBe(discussionId);
    expect(payload!.authorName).toBe('Alice Author');

    // Single comment -> no replies (empty array or undefined)
    const replies = payload!.replies ?? [];
    expect(replies).toHaveLength(0);
  });
});
