'use client';

import type { EditorValueInput, Value } from 'platejs';
import type { CommentThread } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { Plate, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { CommentComposer } from '@/registry/components/editor/comment';
import { CommentToolbarButton } from '@/registry/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { LinkKit } from '@/registry/components/editor/link';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import { Toolbar } from '@/registry/components/editor/toolbar';
import {
  commentThreads,
  commentUsers,
  commentValue,
} from '@/registry/examples/values/comment-value';

export default function CommentPersistenceDemo() {
  const [saved, setSaved] = React.useState<{
    document: EditorValueInput<Value>;
    threads: readonly CommentThread[];
  } | null>(null);
  const [loaded, setLoaded] = React.useState<{
    document: EditorValueInput<Value>;
    threads: readonly CommentThread[];
  }>({
    document: commentValue,
    threads: commentThreads,
  });
  const [failNext, setFailNext] = React.useState(true);
  const [status, setStatus] = React.useState(
    'Snapshots stay in memory in this example.'
  );
  const editor = useCreateEditor(
    {
      plugins: [
        ...BasicBlocksKit,
        ...LinkKit,
        ...SuggestionKit,
        ...DiscussionKit,
        CommentsPlugin.configure({
          initialState: {
            currentUserId: 'alice',
            users: commentUsers,
            initialThreads: loaded.threads,
          },
        }),
      ],
      initialValue: loaded.document,
    },
    [loaded]
  );

  return (
    <Plate editor={editor} key={editor.id}>
      <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setSaved(
                structuredClone({
                  document: editor.read.value(),
                  threads: editor.plugin(CommentsPlugin).api.getThreads(),
                })
              );
              setStatus('Saved the document and its comments in memory.');
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
              setStatus(
                'Reloaded the saved snapshot. Unsaved changes were discarded.'
              );
            }}
            size="sm"
            variant="outline"
          >
            Reload snapshot
          </Button>
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {status}
        </p>
        <EditorContainer className="h-[280px] rounded-md border" variant="demo">
          <Toolbar className="border-b px-3 py-1">
            <CommentToolbarButton />
          </Toolbar>
          <Editor
            aria-label="Saved comments document"
            className="h-auto min-h-[240px] px-8 pb-12 sm:px-12"
            variant="demo"
          />
        </EditorContainer>
        <div className="flex flex-col gap-3 rounded-md border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Try a failed reply</p>
            <Button
              disabled={failNext}
              onClick={() => setFailNext(true)}
              size="sm"
              variant="outline"
            >
              Simulate next failure
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Reply to Charlie’s thread.{' '}
            {failNext
              ? 'The next send will fail; send again to retry with your draft intact.'
              : 'The next send will succeed.'}
          </p>
          <CommentComposer
            ariaLabel="Reply with simulated failure"
            onSubmit={async (body) => {
              if (failNext) {
                setFailNext(false);
                return false;
              }
              const result = await editor
                .plugin(CommentsPlugin)
                .api.reply('discussion1', body);
              if (result) {
                editor.plugin(CommentsPlugin).api.setActive(['discussion1']);
                setStatus(
                  'Reply added. Save a snapshot to keep it for reload.'
                );
              }
              return result;
            }}
            placeholder="Write a reply, then try sending it twice..."
          />
        </div>
      </div>
    </Plate>
  );
}
