'use client';

import type { Range, Value } from 'platejs';
import { BaseCommentsPlugin, type CommentThread } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { Plate, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  commentDecorationAttributes,
  createCommentValue,
} from '@/registry/components/editor/comment';
import { commentDecorationAttributes as staticCommentDecorationAttributes } from '@/registry/components/editor/comment-static';
import { CommentToolbarButton } from '@/registry/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorStatic } from '@/registry/components/editor/editor-static';
import {
  FixedToolbar,
  FixedToolbarPlugin,
} from '@/registry/components/editor/fixed-toolbar';
import { ModeToolbarButton } from '@/registry/components/editor/mode-toolbar-button';
import { EditorKit } from '@/registry/components/editor/plugins';
import { BaseEditorKit } from '@/registry/components/editor/plugins-static';
import { suggestionValue } from '@/registry/examples/values/suggestion-value';

const commentRanges: readonly Range[] = [
  {
    anchor: { offset: 5, path: [0, 0] },
    focus: { offset: 34, path: [0, 0] },
  },
  {
    anchor: { offset: 24, path: [0, 0] },
    focus: { offset: 55, path: [0, 0] },
  },
];

const createInitialValue = (): Value => [
  {
    children: [
      {
        text: 'This paragraph has two overlapping comments backed by persistent editor anchors.',
      },
    ],
    type: 'paragraph',
  },
  ...structuredClone(suggestionValue),
];

const initialThreads: readonly CommentThread[] = [
  ...commentRanges.map((range, index): CommentThread => ({
    createdAt: '2026-09-09T12:00:00.000Z',
    excerpt:
      index === 0
        ? 'paragraph has two overlapping'
        : 'overlapping comments backed by',
    id: index === 0 ? 'ownership' : 'overlap',
    messages: [
      {
        body: createCommentValue(
          index === 0
            ? 'The first thread stores its body with a document range.'
            : 'Overlaps stay ordered without nested leaf renderers.'
        ),
        createdAt: '2026-09-09T12:00:00.000Z',
        id: index === 0 ? 'ownership-message' : 'overlap-message',
        userId: index === 0 ? 'alice' : 'bob',
      },
    ],
    resolved: false,
    status: 'published',
    target: { type: 'range', range },
    userId: index === 0 ? 'alice' : 'bob',
  })),
  {
    createdAt: '2026-09-09T12:00:00.000Z',
    excerpt: 'tighten the wording',
    id: 'suggestion-thread',
    messages: [
      {
        body: [
          {
            children: [
              { text: 'This suggestion is ' },
              { bold: true, text: 'clearer' },
              { text: '; keep it concise.' },
            ],
            type: 'paragraph',
          },
        ],
        createdAt: '2026-09-09T12:00:00.000Z',
        id: 'suggestion-message',
        userId: 'charlie',
      },
    ],
    resolved: false,
    status: 'published',
    target: { type: 'suggestion', id: 'tighten' },
    userId: 'charlie',
  },
];

const initialState = {
  currentUserId: 'alice',
  initialThreads,
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
};

const DiscussionDemoToolbarPlugin = FixedToolbarPlugin.configure({
  slots: {
    beforeEditable: () => (
      <FixedToolbar className="justify-end gap-1">
        <CommentToolbarButton />
        <ModeToolbarButton />
      </FixedToolbar>
    ),
  },
});

const DiscussionReviewerToolbarPlugin = FixedToolbarPlugin.configure({
  slots: {
    beforeEditable: () => (
      <FixedToolbar className="justify-end">
        <ModeToolbarButton />
      </FixedToolbar>
    ),
  },
});

export default function DiscussionProof() {
  const [loadError, setLoadError] = React.useState(false);
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      ...DiscussionKit,
      DiscussionDemoToolbarPlugin,
      CommentsPlugin.configure({ initialState }),
    ],
    initialValue: createInitialValue(),
  });
  const reviewerEditor = useCreateEditor({
    plugins: [
      ...EditorKit,
      DiscussionReviewerToolbarPlugin,
      CommentsPlugin.configure({
        initialState,
        decorate: { attributes: commentDecorationAttributes },
      }),
    ],
    initialValue: createInitialValue(),
  });
  const staticEditor = useCreateEditor({
    plugins: [
      ...BaseEditorKit,
      BaseCommentsPlugin.configure({
        initialState,
        decorate: { attributes: staticCommentDecorationAttributes },
      }),
    ],
    initialValue: createInitialValue(),
  });
  React.useEffect(() => {
    const comments = editor.plugin(CommentsPlugin).api;
    return comments.subscribeThreads(({ ids, reason }) => {
      if (reason !== 'data') return;
      for (const snapshot of [reviewerEditor, staticEditor]) {
        const target = snapshot.plugin(BaseCommentsPlugin).api;
        target.setThreads(
          target.getThreads().flatMap((thread) => {
            if (!ids.includes(thread.id)) return [thread];
            const updated = comments.getThread(thread.id);
            return updated ? [{ ...updated, target: thread.target }] : [];
          })
        );
      }
    });
  }, [editor, reviewerEditor, staticEditor]);

  return (
    <div className="flex flex-col gap-4">
      <div
        aria-label="Comment data loading"
        className="flex items-center gap-3"
        role="group"
      >
        <Button
          onClick={() => {
            try {
              const comments = editor.plugin(CommentsPlugin).api;
              if (loadError) {
                comments.setThreads(
                  JSON.parse(JSON.stringify(comments.getThreads()))
                );
                setLoadError(false);
              } else {
                comments.setThreads([
                  ...comments.getThreads(),
                  initialThreads[0],
                ]);
              }
            } catch {
              setLoadError(true);
            }
          }}
          size="sm"
          variant="outline"
        >
          {loadError ? 'Reload valid comments' : 'Load invalid comments'}
        </Button>
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {loadError
            ? 'Invalid comment records rejected'
            : 'Comment records loaded'}
        </span>
      </div>

      <div className="grid gap-4">
        <div className="min-w-0" data-comment-editor="primary">
          <Plate editor={editor}>
            <EditorContainer
              className="grid h-[520px] grid-cols-1 grid-rows-[auto_minmax(0,1fr)]"
              variant="demo"
            >
              <Editor className="px-8" variant="fullWidth" />
            </EditorContainer>
          </Plate>
        </div>

        <div
          className="flex min-w-0 flex-col gap-2"
          data-comment-editor="reviewer"
        >
          <h2 className="text-sm font-medium">Read-only reviewer</h2>
          <Plate editor={reviewerEditor} readOnly>
            <EditorContainer
              className="grid h-[180px] grid-rows-[auto_minmax(0,1fr)]"
              variant="demo"
            >
              <Editor
                className="size-full px-6 py-3 text-base"
                variant="none"
              />
            </EditorContainer>
          </Plate>
        </div>

        <div
          className="flex min-w-0 flex-col gap-2"
          data-comment-editor="static"
        >
          <h2 className="text-sm font-medium">Static snapshot</h2>
          <div className="rounded-md border p-6">
            <EditorStatic
              aria-label="Static annotated document"
              className="text-base"
              editor={staticEditor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
