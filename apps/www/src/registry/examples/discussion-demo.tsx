'use client';

import type { Value } from 'platejs';
import type { CommentThread } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { createCommentValue } from '@/registry/components/editor/comment';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

export default function DiscussionDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          users: {
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
          },
          initialThreads,
        },
      }),
    ],
    userId: 'alice',
    initialValue: value,
  });
  React.useEffect(() => {
    if (editor.read.authored.changes({ status: 'pending' }).items.length > 0) {
      return;
    }
    editor.update((tx) => {
      tx.history.skip();
      tx.authored.propose();
      tx.text.insert('collaboratively ', {
        at: { offset: 18, path: [1, 0] },
      });
    });
  }, [editor]);

  return (
    <EditorRoot editor={editor}>
      <EditorContainer
        className="grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden"
        variant="demo"
      >
        <Editor className="min-w-0" variant="demo" />
      </EditorContainer>
    </EditorRoot>
  );
}

const discussionTrailingText =
  ' on many text segments. You can even have overlapping annotations!';

const initialThreads: CommentThread[] = [
  {
    id: 'discussion1',
    createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    resolved: false,
    status: 'published',
    excerpt: 'comments on many text segments',
    userId: 'charlie',
    target: {
      type: 'range',
      range: {
        anchor: { path: [1, 3, 0], offset: 0 },
        focus: {
          path: [1, 4],
          offset: discussionTrailingText.indexOf('.'),
        },
      },
    },
    messages: [
      {
        id: 'discussion1-comment',
        userId: 'charlie',
        createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
        body: createCommentValue(
          'Comments are a great way to provide feedback and discuss changes.'
        ),
      },
      {
        id: 'discussion1-reply',
        userId: 'bob',
        createdAt: new Date(Date.now() - 8 * 60_000).toISOString(),
        body: createCommentValue(
          'Agreed! The link to the docs makes it easy to learn more.'
        ),
      },
    ],
  },
  {
    id: 'discussion2',
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    resolved: false,
    status: 'published',
    excerpt: 'overlapping',
    userId: 'bob',
    target: {
      type: 'range',
      range: {
        anchor: {
          path: [1, 4],
          offset: discussionTrailingText.indexOf('overlapping'),
        },
        focus: {
          path: [1, 4],
          offset:
            discussionTrailingText.indexOf('overlapping') +
            'overlapping'.length,
        },
      },
    },
    messages: [
      {
        id: 'discussion2-comment',
        userId: 'bob',
        createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
        body: createCommentValue(
          'Nice demonstration of overlapping annotations with both comments and suggestions!'
        ),
      },
      {
        id: 'discussion2-reply',
        userId: 'charlie',
        createdAt: new Date(Date.now() - 3 * 60_000).toISOString(),
        body: createCommentValue(
          'This helps users understand how powerful the editor can be.'
        ),
      },
    ],
  },
];
const value: Value = [
  { type: 'heading', level: 2, children: [{ text: 'Discussions' }] },
  {
    type: 'paragraph',
    children: [
      { text: 'Review and refine content together. Use ' },
      {
        type: 'link',
        url: '/docs/suggestion',
        children: [
          {
            text: 'suggestions',
          },
        ],
      },
      {
        text: ' like this added text or to mark text for removal. Discuss changes using ',
      },
      { type: 'link', url: '/docs/comment', children: [{ text: 'comments' }] },
      { text: discussionTrailingText },
    ],
  },
];
