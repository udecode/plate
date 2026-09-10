'use client';

import type { Value } from 'platejs';
import type { CommentThread } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { Plate, useCreateEditor } from 'platejs/react';

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
    initialValue: value,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer
        className="grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden"
        variant="demo"
      >
        <Editor className="min-w-0" variant="demo" />
      </EditorContainer>
    </Plate>
  );
}

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
        anchor: { path: [1, 6, 0], offset: 0 },
        focus: { path: [1, 7], offset: 22 },
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
        anchor: { path: [1, 8], offset: 0 },
        focus: { path: [1, 8], offset: 11 },
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

const createdAt = Date.now();
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
            suggestion: true,
            suggestion_playground1: {
              id: 'playground1',
              createdAt,
              type: 'insert',
              userId: 'alice',
            },
          },
        ],
      },
      {
        text: ' like this added text',
        suggestion: true,
        suggestion_playground1: {
          id: 'playground1',
          createdAt,
          type: 'insert',
          userId: 'alice',
        },
      },
      { text: ' or to ' },
      {
        text: 'mark text for removal',
        suggestion: true,
        suggestion_playground2: {
          id: 'playground2',
          createdAt: createdAt + 1,
          type: 'remove',
          userId: 'bob',
        },
      },
      { text: '. Discuss changes using ' },
      { type: 'link', url: '/docs/comment', children: [{ text: 'comments' }] },
      { text: ' on many text segments' },
      { text: '. You can even have ' },
      {
        text: 'overlapping',
        suggestion: true,
        suggestion_playground3: {
          id: 'playground3',
          createdAt: createdAt + 2,
          type: 'insert',
          userId: 'charlie',
        },
      },
      { text: ' annotations!' },
    ],
  },
];
