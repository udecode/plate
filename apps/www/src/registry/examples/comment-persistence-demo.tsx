'use client';

import type { EditorValueInput, Value } from 'platejs';
import type {
  CommentRanges,
  CommentsPluginState,
  CommentThread,
  SavedComments,
} from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import {
  CommentComposer,
  CommentKit,
} from '@/registry/components/editor/comment';
import {
  AllCommentsButton,
  CommentToolbarButton,
} from '@/registry/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { LinkKit } from '@/registry/components/editor/link';
import { Toolbar } from '@/registry/components/editor/toolbar';
import {
  createCommentSnapshot,
  commentUsers,
} from '@/registry/examples/values/comment-value';

type Revision = {
  commentRanges: CommentRanges;
  document: EditorValueInput<Value>;
};

const initial = createCommentSnapshot();

export default function CommentPersistenceDemo() {
  const [saved, setSaved] = React.useState<Revision | null>(null);
  const [loaded, setLoaded] = React.useState<Revision>({
    commentRanges: initial.comments.ranges,
    document: initial.document,
  });
  const [preview, setPreview] = React.useState<{
    comments: SavedComments;
    document: EditorValueInput<Value>;
  } | null>(null);
  const [failNext, setFailNext] = React.useState(true);
  const [status, setStatus] = React.useState(
    'Snapshots stay in memory in this example.'
  );
  const [persistence] = React.useState(() => {
    let rejectNextAction = true;
    const threadTable = new Map<string, CommentThread>(
      initial.comments.threads.map((thread) => [thread.id, thread])
    );
    const mutate: CommentsPluginState['mutate'] = (request) => {
      if (
        (request.operation === 'reply' || request.operation === 'reopen') &&
        rejectNextAction
      ) {
        rejectNextAction = false;
        setFailNext(false);
        return { status: 'reject', code: 'simulated-failure' };
      }
      const id = request.proposed?.id ?? request.previous?.id;
      if (request.proposed) {
        threadTable.set(request.proposed.id, request.proposed);
      } else if (id) threadTable.delete(id);
      return { status: 'commit', thread: request.proposed };
    };
    return {
      mutate,
      threads: () => [...threadTable.values()],
      simulateFailure: () => {
        rejectNextAction = true;
        setFailNext(true);
      },
    };
  });
  const editor = useCreateEditor(
    {
      plugins: [
        ...BasicBlocksKit,
        ...LinkKit,
        ...DiscussionKit,
        CommentsPlugin.configure({
          initialState: {
            users: commentUsers,
            initialComments: {
              ranges: loaded.commentRanges,
              threads: persistence.threads(),
            },
            mutate: persistence.mutate,
          },
        }),
      ],
      initialValue: loaded.document,
      userId: 'alice',
    },
    [loaded]
  );

  return (
    <EditorRoot editor={editor} key={editor.id}>
      <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setSaved(
                structuredClone({
                  commentRanges: editor.plugin(CommentsPlugin).api.ranges(),
                  document: editor.read.value(),
                })
              );
              setStatus('Saved the document and its comment ranges in memory.');
            }}
            size="sm"
            variant="outline"
          >
            Save snapshot
          </Button>
          <Button
            disabled={!saved}
            onClick={() => {
              if (!saved) return;
              setLoaded(structuredClone(saved));
              setPreview(null);
              setStatus(
                'Reloaded the saved snapshot in a fresh editor with an empty undo history.'
              );
            }}
            size="sm"
            variant="outline"
          >
            Reload snapshot
          </Button>
          <Button
            disabled={!saved}
            onClick={() => {
              if (!saved) return;
              setPreview(
                structuredClone({
                  comments: {
                    ranges: saved.commentRanges,
                    threads: persistence.threads(),
                  },
                  document: saved.document,
                })
              );
            }}
            size="sm"
            variant="outline"
          >
            Preview saved version with current comments
          </Button>
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {status}
        </p>
        <EditorContainer className="h-[280px] rounded-md border">
          <Toolbar className="border-b px-3 py-1">
            <CommentToolbarButton />
            <AllCommentsButton />
          </Toolbar>
          <Editor
            aria-label="Saved comments document"
            className="h-auto min-h-[240px] px-[clamp(24px,8%,48px)] pb-12"
            variant="demo"
          />
        </EditorContainer>
        <div className="flex flex-col gap-3 rounded-md border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Try a failed reply or reopen</p>
            <Button
              disabled={failNext}
              onClick={persistence.simulateFailure}
              size="sm"
              variant="outline"
            >
              Simulate next failure
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Reply to Charlie’s thread.{' '}
            {failNext
              ? 'The next reply or reopen will fail. Try again afterward; your reply draft is preserved.'
              : 'The next reply or reopen will succeed.'}
          </p>
          <CommentComposer
            ariaLabel="Reply with simulated failure"
            onSubmit={async (body) => {
              const result = await editor
                .plugin(CommentsPlugin)
                .api.reply('discussion1', body);
              if (result.status === 'applied') {
                editor.plugin(CommentsPlugin).api.setActive(['discussion1']);
                setStatus('Reply saved to the thread table; reload keeps it.');
              }
              return result;
            }}
            placeholder="Write a reply, then try sending it twice..."
          />
        </div>
        {preview && <HistoricalComments snapshot={preview} />}
      </div>
    </EditorRoot>
  );
}

function HistoricalComments({
  snapshot,
}: {
  snapshot: { comments: SavedComments; document: EditorValueInput<Value> };
}) {
  const editor = useCreateEditor(
    {
      plugins: [
        ...BasicBlocksKit,
        ...LinkKit,
        ...CommentKit,
        CommentsPlugin.configure({
          initialState: { initialComments: snapshot.comments },
        }),
      ],
      initialValue: snapshot.document,
    },
    [snapshot]
  );
  return (
    <section className="flex flex-col gap-3 rounded-md border p-4">
      <h3 className="text-sm font-medium">
        Saved version with current comments
      </h3>
      <p className="text-sm text-muted-foreground">
        Conversations stay current. Comments without a target in this version
        are unavailable.
      </p>
      <EditorRoot editor={editor} readOnly>
        <EditorContainer>
          <Toolbar className="border-b px-3 py-1">
            <AllCommentsButton />
          </Toolbar>
          <Editor
            aria-label="Historical comments document"
            readOnly
            variant="demo"
          />
        </EditorContainer>
      </EditorRoot>
    </section>
  );
}
