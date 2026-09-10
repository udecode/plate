'use client';

import type { Value } from 'platejs';
import type { CommentThread } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { Plate, useCreateEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { createCommentValue } from '@/registry/components/editor/comment';
import { CommentToolbarButton } from '@/registry/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/registry/components/editor/history-toolbar-button';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import { Toolbar } from '@/registry/components/editor/toolbar';
import { commentUsers } from '@/registry/examples/values/comment-value';

export default function CommentOverlapDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...BasicBlocksKit,
      ...SuggestionKit,
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          users: commentUsers,
          initialThreads,
        },
      }),
    ],
    initialValue: value,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer className="h-[360px]" variant="demo">
        <Toolbar className="border-b px-3 py-1">
          <UndoToolbarButton aria-label="Undo" />
          <RedoToolbarButton aria-label="Redo" />
          <CommentToolbarButton />
        </Toolbar>
        <Editor
          aria-label="Overlapping comments document"
          className="h-auto min-h-[280px] px-8 pb-16 sm:px-12"
          variant="demo"
        />
      </EditorContainer>
    </Plate>
  );
}

const text =
  'Edit these overlapping comments, then undo and redo your changes.';
const value: Value = [
  { type: 'paragraph', children: [{ text }] },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Click “overlapping” to open both threads. Delete the first paragraph’s text and use its comment button to find the conversations again.',
      },
    ],
  },
];

const initialThreads: CommentThread[] = [
  {
    id: 'wording',
    userId: 'alice',
    createdAt: '2026-09-10T10:00:00.000Z',
    resolved: false,
    status: 'published',
    excerpt: 'these overlapping',
    target: {
      type: 'range',
      range: {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 22 },
      },
    },
    messages: [
      {
        id: 'wording-message',
        userId: 'alice',
        createdAt: '2026-09-10T10:00:00.000Z',
        body: createCommentValue('Let’s keep this wording concise.'),
      },
    ],
  },
  {
    id: 'context',
    userId: 'bob',
    createdAt: '2026-09-10T10:01:00.000Z',
    resolved: false,
    status: 'published',
    excerpt: 'overlapping comments',
    target: {
      type: 'range',
      range: {
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 31 },
      },
    },
    messages: [
      {
        id: 'context-message',
        userId: 'bob',
        createdAt: '2026-09-10T10:01:00.000Z',
        body: createCommentValue(
          'This thread shares the word “overlapping” with Alice’s.'
        ),
      },
    ],
  },
];
