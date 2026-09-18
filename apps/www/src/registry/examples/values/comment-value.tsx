import {
  BaseHeadingPlugin,
  BaseLinkPlugin,
  createEditor,
  type Value,
} from 'platejs';
import type {
  CommentsJSON,
  CommentThread,
  CommentUser,
} from 'platejs/comments';

import { createCommentValue } from '@/registry/components/editor/comment';

export const commentUsers: Record<string, CommentUser> = {
  alice: {
    id: 'alice',
    name: 'Alice',
    avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=alice6',
  },
  bob: {
    id: 'bob',
    name: 'Bob',
    avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=bob4',
  },
  charlie: {
    id: 'charlie',
    name: 'Charlie',
    avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=charlie2',
  },
};

const trailingText =
  ' on many text segments. You can even have overlapping annotations!';

export const commentValue: Value = [
  { type: 'heading', level: 2, children: [{ text: 'Comments' }] },
  {
    type: 'paragraph',
    children: [
      { text: 'Discuss changes using ' },
      { type: 'link', url: '/docs/comment', children: [{ text: 'comments' }] },
      { text: trailingText },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Select some text and add your own comment as Alice.' }],
  },
];

const commentThreads: CommentThread[] = [
  {
    id: 'discussion1',
    createdAt: '2026-09-10T10:00:00.000Z',
    resolution: null,
    status: 'published',
    excerpt: 'comments on many text segments',
    userId: 'charlie',
    target: { type: 'range' },
    messages: [
      {
        id: 'discussion1-comment',
        userId: 'charlie',
        createdAt: '2026-09-10T10:00:00.000Z',
        body: createCommentValue(
          'Comments are a great way to provide feedback and discuss changes.'
        ),
      },
      {
        id: 'discussion1-reply',
        userId: 'bob',
        createdAt: '2026-09-10T10:02:00.000Z',
        body: createCommentValue(
          'Agreed! The link to the docs makes it easy to learn more.'
        ),
      },
    ],
  },
  {
    id: 'discussion2',
    createdAt: '2026-09-10T10:05:00.000Z',
    resolution: null,
    status: 'published',
    excerpt: 'overlapping',
    userId: 'bob',
    target: { type: 'range' },
    messages: [
      {
        id: 'discussion2-comment',
        userId: 'bob',
        createdAt: '2026-09-10T10:05:00.000Z',
        body: createCommentValue(
          'Nice demonstration of overlapping annotations with both comments and suggestions!'
        ),
      },
      {
        id: 'discussion2-reply',
        userId: 'charlie',
        createdAt: '2026-09-10T10:07:00.000Z',
        body: createCommentValue(
          'This helps users understand how powerful the editor can be.'
        ),
      },
    ],
  },
];

export const createCommentSnapshot = (document = commentValue) => {
  const fixture = createEditor({
    plugins: [BaseHeadingPlugin, BaseLinkPlugin],
    initialValue: document,
  });
  const ranges = [
    {
      threadId: 'discussion1',
      range: {
        anchor: { path: [1, 1, 0], offset: 0 },
        focus: { path: [1, 2], offset: trailingText.indexOf('.') },
      },
    },
    {
      threadId: 'discussion2',
      range: {
        anchor: { path: [1, 2], offset: trailingText.indexOf('overlapping') },
        focus: {
          path: [1, 2],
          offset: trailingText.indexOf('overlapping') + 'overlapping'.length,
        },
      },
    },
  ];
  const comments: CommentsJSON = {
    kind: 'plate-comments',
    version: 1,
    threads: commentThreads,
    ranges: ranges.map(({ threadId, range }) => {
      const anchor = fixture.anchor(range, {
        association: 'inward',
        deletion: 'nearest',
      });
      const saved = fixture.anchor.save(anchor);
      anchor.release();
      return { threadId, range: saved };
    }),
  };
  return { document: fixture.read.value(), comments };
};
