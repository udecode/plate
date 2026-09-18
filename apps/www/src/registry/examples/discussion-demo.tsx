'use client';

import { DocumentChange, type EditorDocumentValue } from 'platejs';
import { createAuthoredReviewDocument } from 'platejs/authored';
import type { CommentsJSON, CommentThread } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor, EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { createCommentValue } from '@/registry/components/editor/comment';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
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
          initialComments,
        },
      }),
    ],
    userId: 'alice',
    initialValue: fixture.read.value(),
  });
  return (
    <EditorRoot
      authored={{ intent: 'edit', projection: 'markup' }}
      editor={editor}
    >
      <EditorFrame className="h-[650px]">
        <EditorContainer>
          <Editor className="min-w-0" variant="demo" />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}

const discussionTrailingText = ' on many text segments. You can even have ';

const threads: CommentThread[] = [
  {
    id: 'discussion1',
    createdAt: '2026-09-09T12:03:00.000Z',
    resolution: null,
    status: 'published',
    excerpt: 'comments on many text segments',
    userId: 'charlie',
    target: { type: 'range' },
    messages: [
      {
        id: 'discussion1-comment',
        userId: 'charlie',
        createdAt: '2026-09-09T12:03:00.000Z',
        body: createCommentValue(
          'Comments are a great way to provide feedback and discuss changes.'
        ),
      },
      {
        id: 'discussion1-reply',
        userId: 'bob',
        createdAt: '2026-09-09T12:04:00.000Z',
        body: createCommentValue(
          'Agreed! The link to the docs makes it easy to learn more.'
        ),
      },
    ],
  },
  {
    id: 'discussion2',
    createdAt: '2026-09-09T12:05:00.000Z',
    resolution: null,
    status: 'published',
    excerpt: 'overlapping',
    userId: 'bob',
    target: { type: 'change', id: 'playground3' },
    messages: [
      {
        id: 'discussion2-comment',
        userId: 'bob',
        createdAt: '2026-09-09T12:05:00.000Z',
        body: createCommentValue(
          'Nice demonstration of overlapping annotations with both comments and suggestions!'
        ),
      },
      {
        id: 'discussion2-reply',
        userId: 'charlie',
        createdAt: '2026-09-09T12:06:00.000Z',
        body: createCommentValue(
          'This helps users understand how powerful the editor can be.'
        ),
      },
    ],
  },
];
const createDiscussionValue = ({
  inserted = false,
  removed = false,
  overlapping = false,
}: {
  inserted?: boolean;
  removed?: boolean;
  overlapping?: boolean;
}): EditorDocumentValue => {
  const leadingText = 'Review and refine content together. Use ';
  const reviewText = ` or to ${removed ? '' : 'mark text for removal'}. Discuss changes using `;

  return {
    children: [
      { type: 'heading', level: 2, children: [{ text: 'Discussions' }] },
      {
        type: 'paragraph',
        children: [
          ...(inserted
            ? [
                { text: leadingText },
                {
                  type: 'link',
                  url: '/docs/suggestion',
                  children: [{ text: 'suggestions' }],
                },
                { text: ` like this added text${reviewText}` },
              ]
            : [{ text: leadingText + reviewText }]),
          {
            type: 'link',
            url: '/docs/comment',
            children: [{ text: 'comments' }],
          },
          {
            text: `${discussionTrailingText}${overlapping ? 'overlapping ' : ''}annotations!`,
          },
        ],
      },
    ],
  };
};

const accepted = createDiscussionValue({});
const deleted = createDiscussionValue({ removed: true });
const overlapped = createDiscussionValue({ removed: true, overlapping: true });
const proposed = createDiscussionValue({
  inserted: true,
  removed: true,
  overlapping: true,
});

const fixture = createEditor({
  plugins: EditorKit,
  initialValue: createAuthoredReviewDocument({
    accepted,
    revisions: [
      {
        id: 'playground2',
        authorId: 'bob',
        createdAt: Date.parse('2026-09-09T12:00:00.000Z'),
        change: DocumentChange.between(accepted, deleted),
      },
      {
        id: 'playground3',
        authorId: 'charlie',
        createdAt: Date.parse('2026-09-09T12:01:00.000Z'),
        change: DocumentChange.between(deleted, overlapped),
      },
      {
        id: 'playground1',
        authorId: 'alice',
        createdAt: Date.parse('2026-09-09T12:02:00.000Z'),
        change: DocumentChange.between(overlapped, proposed),
      },
    ],
  }),
  userId: 'alice',
});
const anchor = fixture.anchor(
  {
    anchor: { path: [1, 1, 0], offset: 0 },
    focus: { path: [1, 2], offset: discussionTrailingText.indexOf('.') },
  },
  { association: 'inward', deletion: 'nearest' }
);
const initialComments: CommentsJSON = {
  kind: 'plate-comments',
  version: 1,
  threads,
  ranges: [{ threadId: 'discussion1', range: fixture.anchor.save(anchor) }],
};
anchor.release();
