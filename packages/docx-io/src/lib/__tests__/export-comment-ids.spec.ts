/**
 * Tests for comment ID uniqueness and author resolution during export.
 *
 * Verifies that:
 * - Discussion IDs (not comment IDs) are used as export payload IDs
 * - Cross-discussion duplicate comment IDs don't collide
 * - Author names flow through correctly to the OOXML output
 * - Reply composite IDs are unique per discussion
 */

import { describe, expect, it } from 'bun:test';

import type { TNode } from 'platejs';

import type { DocxExportDiscussion } from '../exportTrackChanges';
import { injectDocxTrackingTokens } from '../exportTrackChanges';
import type { CommentPayload } from '../html-to-docx/tracking';
import { splitDocxTrackingTokens } from '../html-to-docx/tracking';

/** Extract all CommentPayloads from injected token text for given discussion IDs */
function extractAllCommentPayloads(
  discussionIds: string[],
  discussions: DocxExportDiscussion[]
): Map<string, CommentPayload> {
  const marks: Record<string, true> = {};

  for (const id of discussionIds) {
    marks[`comment_${id}`] = true;
  }

  const value: TNode[] = [
    {
      type: 'p',
      children: [{ text: 'Annotated text', ...marks }],
    },
  ];

  const result = injectDocxTrackingTokens(value, { discussions });
  const injectedText = (
    (result[0] as Record<string, unknown>).children as Record<string, unknown>[]
  )[0].text as string;

  const tokens = splitDocxTrackingTokens(injectedText);
  const payloads = new Map<string, CommentPayload>();

  for (const token of tokens) {
    if (token.type === 'commentStart') {
      payloads.set(token.data.id, token.data);
    }
  }

  return payloads;
}

describe('export comment ID uniqueness', () => {
  it('should use discussion ID as payload ID, not comment ID', () => {
    const discussions: DocxExportDiscussion[] = [
      {
        id: 'discussion1',
        comments: [
          {
            id: 'comment1',
            contentRich: [{ type: 'p', children: [{ text: 'Root comment' }] }],
            createdAt: '2025-01-15T10:00:00.000Z',
            user: { id: 'alice', name: 'Alice' },
            userId: 'alice',
          },
        ],
        createdAt: '2025-01-15T10:00:00.000Z',
        documentContent: 'Root comment',
        user: { id: 'alice', name: 'Alice' },
        userId: 'alice',
      },
    ];

    const payloads = extractAllCommentPayloads(['discussion1'], discussions);

    expect(payloads.size).toBe(1);
    // Payload ID must be the discussion ID, NOT the comment ID
    expect(payloads.has('discussion1')).toBe(true);
    expect(payloads.has('comment1')).toBe(false);
  });

  it('should not collide when two discussions use the same comment IDs', () => {
    const discussions: DocxExportDiscussion[] = [
      {
        id: 'discussion1',
        comments: [
          {
            id: 'comment1', // Duplicate across discussions
            contentRich: [{ type: 'p', children: [{ text: 'From Alice' }] }],
            createdAt: '2025-01-15T10:00:00.000Z',
            user: { id: 'alice', name: 'Alice' },
            userId: 'alice',
          },
        ],
        createdAt: '2025-01-15T10:00:00.000Z',
        documentContent: 'From Alice',
        user: { id: 'alice', name: 'Alice' },
        userId: 'alice',
      },
      {
        id: 'discussion2',
        comments: [
          {
            id: 'comment1', // Same ID as above — must not collide
            contentRich: [{ type: 'p', children: [{ text: 'From Bob' }] }],
            createdAt: '2025-01-15T11:00:00.000Z',
            user: { id: 'bob', name: 'Bob' },
            userId: 'bob',
          },
        ],
        createdAt: '2025-01-15T11:00:00.000Z',
        documentContent: 'From Bob',
        user: { id: 'bob', name: 'Bob' },
        userId: 'bob',
      },
    ];

    const payloads = extractAllCommentPayloads(
      ['discussion1', 'discussion2'],
      discussions
    );

    // Must produce 2 distinct payloads keyed by discussion ID
    expect(payloads.size).toBe(2);

    const d1 = payloads.get('discussion1');
    const d2 = payloads.get('discussion2');
    expect(d1).toBeDefined();
    expect(d2).toBeDefined();

    // Author names must be distinct (no collision/overwrite)
    expect(d1!.authorName).toBe('Alice');
    expect(d2!.authorName).toBe('Bob');

    // Payload IDs must differ
    expect(d1!.id).not.toBe(d2!.id);
  });

  it('should produce unique reply composite IDs across discussions', () => {
    const discussions: DocxExportDiscussion[] = [
      {
        id: 'discussion1',
        comments: [
          {
            id: 'comment1',
            contentRich: [{ type: 'p', children: [{ text: 'Root 1' }] }],
            createdAt: '2025-01-15T10:00:00.000Z',
            user: { id: 'alice', name: 'Alice' },
            userId: 'alice',
          },
          {
            id: 'reply1', // Same reply ID in both discussions
            contentRich: [{ type: 'p', children: [{ text: 'Reply in d1' }] }],
            createdAt: '2025-01-15T11:00:00.000Z',
            user: { id: 'bob', name: 'Bob' },
            userId: 'bob',
          },
        ],
        createdAt: '2025-01-15T10:00:00.000Z',
        documentContent: 'Root 1',
        user: { id: 'alice', name: 'Alice' },
        userId: 'alice',
      },
      {
        id: 'discussion2',
        comments: [
          {
            id: 'comment1',
            contentRich: [{ type: 'p', children: [{ text: 'Root 2' }] }],
            createdAt: '2025-01-15T12:00:00.000Z',
            user: { id: 'charlie', name: 'Charlie' },
            userId: 'charlie',
          },
          {
            id: 'reply1', // Same reply ID as discussion1
            contentRich: [{ type: 'p', children: [{ text: 'Reply in d2' }] }],
            createdAt: '2025-01-15T13:00:00.000Z',
            user: { id: 'dave', name: 'Dave' },
            userId: 'dave',
          },
        ],
        createdAt: '2025-01-15T12:00:00.000Z',
        documentContent: 'Root 2',
        user: { id: 'charlie', name: 'Charlie' },
        userId: 'charlie',
      },
    ];

    const payloads = extractAllCommentPayloads(
      ['discussion1', 'discussion2'],
      discussions
    );

    const d1 = payloads.get('discussion1');
    const d2 = payloads.get('discussion2');

    expect(d1!.replies).toHaveLength(1);
    expect(d2!.replies).toHaveLength(1);

    // Reply IDs in the payload are preserved from the comment data
    expect(d1!.replies![0].id).toBe('reply1');
    expect(d2!.replies![0].id).toBe('reply1');

    // But the discussion IDs (used as lookup keys) are different,
    // so xml-builder will create composite IDs:
    // "discussion1-reply-reply1" vs "discussion2-reply-reply1"
    // — these are unique because the parent ID differs
    expect(d1!.id).toBe('discussion1');
    expect(d2!.id).toBe('discussion2');

    // Author names must be preserved per discussion
    expect(d1!.replies![0].authorName).toBe('Bob');
    expect(d2!.replies![0].authorName).toBe('Dave');
  });
});

describe('export comment author resolution', () => {
  it('should resolve author from user.name', () => {
    const discussions: DocxExportDiscussion[] = [
      {
        id: 'disc-1',
        comments: [
          {
            contentRich: [{ type: 'p', children: [{ text: 'Comment' }] }],
            createdAt: '2025-01-15T10:00:00.000Z',
            user: { id: 'user-1', name: 'Jane Doe' },
            userId: 'user-1',
          },
        ],
        createdAt: '2025-01-15T10:00:00.000Z',
        documentContent: 'Comment',
        user: { id: 'user-1', name: 'Jane Doe' },
        userId: 'user-1',
      },
    ];

    const payloads = extractAllCommentPayloads(['disc-1'], discussions);
    const payload = payloads.get('disc-1');

    expect(payload!.authorName).toBe('Jane Doe');
    expect(payload!.authorInitials).toBe('JD');
  });

  it('should fallback to userId when user.name is missing', () => {
    const discussions: DocxExportDiscussion[] = [
      {
        id: 'disc-1',
        comments: [
          {
            contentRich: [{ type: 'p', children: [{ text: 'Comment' }] }],
            createdAt: '2025-01-15T10:00:00.000Z',
            userId: 'charlie',
          },
        ],
        createdAt: '2025-01-15T10:00:00.000Z',
        documentContent: 'Comment',
        userId: 'charlie',
      },
    ];

    const payloads = extractAllCommentPayloads(['disc-1'], discussions);
    const payload = payloads.get('disc-1');

    // Falls back to userId when no user.name
    expect(payload!.authorName).toBe('charlie');
  });

  it('should use "unknown" when no author info available', () => {
    const discussions: DocxExportDiscussion[] = [
      {
        id: 'disc-1',
        comments: [
          {
            contentRich: [{ type: 'p', children: [{ text: 'Orphan' }] }],
            createdAt: '2025-01-15T10:00:00.000Z',
          },
        ],
        createdAt: '2025-01-15T10:00:00.000Z',
        documentContent: 'Orphan',
      },
    ];

    const payloads = extractAllCommentPayloads(['disc-1'], discussions);
    const payload = payloads.get('disc-1');

    expect(payload!.authorName).toBe('unknown');
  });

  it('should use userNameMap for author resolution', () => {
    const discussions: DocxExportDiscussion[] = [
      {
        id: 'disc-1',
        comments: [
          {
            contentRich: [{ type: 'p', children: [{ text: 'Comment' }] }],
            createdAt: '2025-01-15T10:00:00.000Z',
            userId: 'user-42',
          },
        ],
        createdAt: '2025-01-15T10:00:00.000Z',
        documentContent: 'Comment',
        userId: 'user-42',
      },
    ];

    const userNameMap = new Map([['user-42', 'Mapped Name']]);

    const value = [
      {
        type: 'p',
        children: [{ text: 'text', 'comment_disc-1': true }],
      },
    ] as TNode[];

    const result = injectDocxTrackingTokens(value, {
      discussions,
      userNameMap,
    });
    const injectedText = (
      (result[0] as Record<string, unknown>).children as Record<
        string,
        unknown
      >[]
    )[0].text as string;

    const tokens = splitDocxTrackingTokens(injectedText);
    const commentStart = tokens.find((t) => t.type === 'commentStart');

    expect(commentStart).toBeDefined();
    if (commentStart?.type === 'commentStart') {
      expect(commentStart.data.authorName).toBe('Mapped Name');
    }
  });
});
