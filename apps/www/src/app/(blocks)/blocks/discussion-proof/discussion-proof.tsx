'use client';

import {
  createEditor,
  DocumentChange,
  type EditorDocumentValue,
  NodeApi,
  type Range,
} from 'platejs';
import { createAuthoredReviewDocument } from 'platejs/authored';
import { BaseCommentsPlugin, type CommentsJSON } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import { BaseSuggestionPlugin } from 'platejs/suggestion';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  commentDecorationAttributes,
  createCommentValue,
} from '@/registry/components/editor/comment';
import { commentDecorationAttributes as staticCommentDecorationAttributes } from '@/registry/components/editor/comment-static';
import {
  AllCommentsButton,
  CommentToolbarButton,
} from '@/registry/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
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

const createInitialValue = (review: string): EditorDocumentValue => ({
  children: [
    {
      children: [
        {
          text: 'This paragraph has two overlapping comments backed by persistent editor anchors.',
        },
      ],
      type: 'paragraph',
    },
    { type: 'paragraph', children: [{ text: review }] },
  ],
});

const createInitialRevision = () => {
  const review = NodeApi.string(suggestionValue[0]);
  const accepted = createInitialValue(
    review.replace('tighten the wording', '')
  );
  const inserted = createInitialValue(review);
  const proposed = createInitialValue(
    review.replace('keep this redundant phrase', '')
  );
  const fixture = createEditor({
    plugins: [...BaseEditorKit, BaseSuggestionPlugin],
    userId: 'alice',
    initialValue: createAuthoredReviewDocument({
      accepted,
      revisions: [
        {
          id: 'tighten',
          authorId: 'alice',
          createdAt: Date.parse('2026-09-09T12:00:00.000Z'),
          change: DocumentChange.between(accepted, inserted),
        },
        {
          id: 'remove',
          authorId: 'bob',
          createdAt: Date.parse('2026-09-09T12:01:00.000Z'),
          change: DocumentChange.between(inserted, proposed),
        },
      ],
    }),
  });
  const comments: CommentsJSON = {
    kind: 'plate-comments',
    version: 1,
    ranges: commentRanges.map((range, index) => {
      const anchor = fixture.anchor(range, {
        association: 'inward',
        deletion: 'nearest',
      });
      const saved = fixture.anchor.save(anchor);
      anchor.release();
      return { threadId: index === 0 ? 'ownership' : 'overlap', range: saved };
    }),
    threads: [
      ...commentRanges.map((_, index) => ({
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
        resolution: null,
        status: 'published' as const,
        target: { type: 'range' as const },
        userId: index === 0 ? 'alice' : 'bob',
      })),
      {
        id: 'suggestion-thread',
        createdAt: '2026-09-09T12:02:00.000Z',
        excerpt: 'tighten the wording',
        userId: 'bob',
        resolution: null,
        status: 'published',
        target: { type: 'change', id: 'tighten' },
        messages: [
          {
            id: 'suggestion-message',
            userId: 'bob',
            createdAt: '2026-09-09T12:02:00.000Z',
            body: [
              {
                type: 'paragraph',
                children: [
                  { text: 'This makes the wording ' },
                  { text: 'clearer', bold: true },
                  { text: '.' },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  return { document: fixture.read.value(), comments };
};

const initialState = {
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
};

const DiscussionDemoToolbarPlugin = FixedToolbarPlugin.configure({
  slots: {
    beforeContainer: () => (
      <FixedToolbar className="justify-end gap-1">
        <CommentToolbarButton />
        <AllCommentsButton />
        <ModeToolbarButton />
      </FixedToolbar>
    ),
  },
});

const DiscussionReviewerToolbarPlugin = FixedToolbarPlugin.configure({
  slots: {
    beforeContainer: () => (
      <FixedToolbar className="justify-end">
        <AllCommentsButton />
        <ModeToolbarButton />
      </FixedToolbar>
    ),
  },
});

export default function DiscussionProof() {
  const [loadError, setLoadError] = React.useState(false);
  const [initialRevision] = React.useState(createInitialRevision);
  const [loaded, setLoaded] = React.useState(initialRevision);
  const editor = useCreateEditor(
    {
      plugins: [
        ...EditorKit,
        ...DiscussionKit,
        DiscussionDemoToolbarPlugin,
        CommentsPlugin.configure({
          initialState: { ...initialState, initialComments: loaded.comments },
        }),
      ],
      userId: 'alice',
      initialValue: loaded.document,
    },
    [loaded]
  );
  const reviewerEditor = useCreateEditor({
    plugins: [
      ...EditorKit,
      DiscussionReviewerToolbarPlugin,
      CommentsPlugin.configure({
        initialState: {
          ...initialState,
          initialComments: initialRevision.comments,
        },
        decorate: { attributes: commentDecorationAttributes },
      }),
    ],
    userId: 'alice',
    initialValue: initialRevision.document,
  });
  const staticEditor = useCreateEditor({
    plugins: [
      ...BaseEditorKit,
      BaseSuggestionPlugin,
      BaseCommentsPlugin.configure({
        initialState: {
          ...initialState,
          initialComments: initialRevision.comments,
        },
        decorate: { attributes: staticCommentDecorationAttributes },
      }),
    ],
    initialValue: initialRevision.document,
  });

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
              const revision = structuredClone({
                document: editor.read.value(),
                comments: editor.plugin(CommentsPlugin).api.toJSON(),
              });
              const candidate = createEditor({
                plugins: [
                  ...EditorKit,
                  CommentsPlugin.configure({
                    initialState: {
                      ...initialState,
                      initialComments: JSON.parse(
                        JSON.stringify({
                          ...revision.comments,
                          version: loadError ? 1 : 0,
                        })
                      ),
                    },
                  }),
                ],
                initialValue: revision.document,
              });
              candidate.plugin(BaseCommentsPlugin).api.getSnapshot();
              setLoaded(revision);
              setLoadError(false);
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
          <EditorRoot editor={editor} key={editor.id}>
            <EditorFrame className="h-[520px]">
              <EditorContainer>
                <Editor className="px-8" variant="fullWidth" />
              </EditorContainer>
            </EditorFrame>
          </EditorRoot>
        </div>

        <div
          className="flex min-w-0 flex-col gap-2"
          data-comment-editor="reviewer"
        >
          <h2 className="text-sm font-medium">Read-only reviewer</h2>
          <EditorRoot editor={reviewerEditor} readOnly>
            <EditorFrame className="h-[180px]">
              <EditorContainer>
                <Editor
                  className="size-full px-6 py-3 text-base"
                  variant="none"
                />
              </EditorContainer>
            </EditorFrame>
          </EditorRoot>
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
