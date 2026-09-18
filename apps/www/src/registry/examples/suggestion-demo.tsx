'use client';

import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor, EditorRoot } from 'platejs/react';
import * as React from 'react';

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

export default function SuggestionDemo() {
  const [editor] = React.useState(() => {
    const current = createEditor({
      plugins: [
        ...BasicBlocksKit,
        ...SuggestionKit,
        ...DiscussionKit,
        CommentsPlugin.configure({
          initialState: {
            currentUserId: 'alice',
            users: { alice: { id: 'alice', name: 'Alice' } },
          },
        }),
      ],
      userId: 'alice',
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Review and refine this sentence.' }],
        },
        {
          type: 'paragraph',
          children: [
            { text: 'Keep this redundant phrase out of the final draft.' },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Try typing your own suggestion here.' }],
        },
      ],
    });

    current.update((tx) => {
      tx.history.skip();
      tx.authored.propose();
      tx.text.insert('collaboratively ', {
        at: { offset: 7, path: [0, 0] },
      });
    });
    current.update((tx) => {
      tx.history.skip();
      tx.authored.propose();
      tx.text.delete({
        at: {
          anchor: { offset: 10, path: [1, 0] },
          focus: { offset: 27, path: [1, 0] },
        },
      });
    });
    return current;
  });

  return (
    <EditorRoot
      editor={editor}
      authored={{ intent: 'propose', projection: 'markup' }}
    >
      <SuggestionDemoContent />
    </EditorRoot>
  );
}

function SuggestionDemoContent() {
  return (
    <EditorContainer className="h-[360px]">
      <Toolbar className="border-b px-3 py-1">
        <UndoToolbarButton aria-label="Undo" />
        <RedoToolbarButton aria-label="Redo" />
        <AllCommentsButton />
        <div className="ml-auto">
          <ModeToolbarButton />
        </div>
      </Toolbar>
      <Editor
        aria-label="Suggestions document"
        className="h-auto min-h-[280px] px-8 pb-16 sm:px-12"
        variant="demo"
      />
    </EditorContainer>
  );
}
