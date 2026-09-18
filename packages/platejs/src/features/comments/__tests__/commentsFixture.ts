import { createEditor, type Range, type Value } from '../../../core';
import {
  BaseCommentsPlugin,
  type CommentThread,
  type CommentsJSON,
} from '../BaseCommentsPlugin';

export const commentRange: Range = {
  anchor: { path: [0, 0], offset: 1 },
  focus: { path: [0, 0], offset: 4 },
};

export const commentValue: Value = [
  { type: 'paragraph', children: [{ text: 'Alpha Beta' }] },
];

export const commentBody = (text = 'A comment'): Value => [
  { type: 'paragraph', children: [{ text }] },
];

export const commentThread = (id = 'thread'): CommentThread => ({
  createdAt: '2026-09-09T12:00:00.000Z',
  excerpt: 'lph',
  id,
  messages: [
    {
      body: commentBody(),
      createdAt: '2026-09-09T12:00:00.000Z',
      id: `${id}-message`,
      userId: 'alice',
    },
  ],
  resolution: null,
  status: 'published',
  target: { type: 'range' },
  userId: 'alice',
});

/** Build semantic fixtures with real opaque range data from the owning codec. */
export const commentsFixture = (
  entries = [{ thread: commentThread(), range: commentRange }],
  initialValue = commentValue
): CommentsJSON => {
  const editor = createEditor({ initialValue });
  const initialComments: CommentsJSON = {
    kind: 'plate-comments',
    version: 1,
    threads: entries.map(({ thread }) => thread),
    ranges: entries.map(({ thread, range }) => {
      const anchor = editor.anchor(range, {
        association: 'inward',
        deletion: 'nearest',
      });
      const saved = editor.anchor.save(anchor);
      anchor.release();
      return { threadId: thread.id, range: saved };
    }),
  };
  const commentsEditor = createEditor({
    initialValue,
    plugins: [
      BaseCommentsPlugin.configure({ initialState: { initialComments } }),
    ],
  });
  return commentsEditor.plugin(BaseCommentsPlugin).api.toJSON();
};
