'use client';

import type { EditorValueInput, Value } from 'platejs';
import type { CommentsJSON } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { AllCommentsButton } from '@/registry/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/registry/components/editor/history-toolbar-button';
import { ModeToolbarButton } from '@/registry/components/editor/mode-toolbar-button';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import { Toolbar } from '@/registry/components/editor/toolbar';
import { createSuggestionDocument } from '@/registry/examples/values/suggestion-document';

type SuggestionSnapshot = {
  document: EditorValueInput<Value>;
  comments: CommentsJSON | null;
};

export default function SuggestionPersistenceDemo() {
  const [saved, setSaved] = React.useState<SuggestionSnapshot | null>(null);
  const [loaded, setLoaded] = React.useState<SuggestionSnapshot>(() => ({
    document: createSuggestionDocument(),
    comments: null,
  }));
  const [status, setStatus] = React.useState(
    'Snapshots stay in memory in this example.'
  );
  const editor = useCreateEditor(
    {
      plugins: [
        ...BasicBlocksKit,
        ...SuggestionKit,
        ...DiscussionKit,
        CommentsPlugin.configure({
          initialState: {
            currentUserId: 'alice',
            users: { alice: { id: 'alice', name: 'Alice' } },
            initialComments: loaded.comments,
          },
        }),
      ],
      initialValue: loaded.document,
      userId: 'alice',
    },
    [loaded]
  );

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setSaved(
              structuredClone({
                document: editor.read.value(),
                comments: editor.plugin(CommentsPlugin).api.toJSON(),
              })
            );
            setStatus('Saved proposals and discussion threads in memory.');
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
              'Reloaded the saved proposals and threads with a fresh undo history. Unsaved changes were discarded.'
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
      <EditorRoot
        editor={editor}
        key={editor.id}
        authored={{ intent: 'propose', projection: 'markup' }}
      >
        <SuggestionPersistenceContent />
      </EditorRoot>
    </div>
  );
}

function SuggestionPersistenceContent() {
  return (
    <EditorContainer className="h-[280px] rounded-md border">
      <Toolbar className="border-b px-3 py-1">
        <UndoToolbarButton aria-label="Undo saved document change" />
        <RedoToolbarButton aria-label="Redo saved document change" />
        <AllCommentsButton />
        <div className="ml-auto">
          <ModeToolbarButton />
        </div>
      </Toolbar>
      <Editor
        aria-label="Saved suggestions document"
        className="h-auto min-h-[200px] px-8 pb-12 sm:px-12"
        variant="demo"
      />
    </EditorContainer>
  );
}
