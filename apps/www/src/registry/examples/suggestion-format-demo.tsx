'use client';

import { CommentsPlugin } from 'platejs/comments/react';
import { BoldPlugin, createEditor, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { AllCommentsButton } from '@/registry/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/registry/components/editor/history-toolbar-button';
import { MarkToolbarButton } from '@/registry/components/editor/mark-toolbar-button';
import { ModeToolbarButton } from '@/registry/components/editor/mode-toolbar-button';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import { Toolbar } from '@/registry/components/editor/toolbar';

export default function SuggestionFormatDemo() {
  const [editor] = React.useState(() => {
    const current = createEditor({
      plugins: [
        ...BasicBlocksKit,
        ...BasicMarksKit,
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
          children: [{ text: 'Make this sentence stand out.' }],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'Select some text and try Bold, or press Enter to add a paragraph.',
            },
          ],
        },
      ],
    });

    current.update((tx) => {
      tx.history.skip();
      tx.authored.propose();
      tx.nodes.set({ bold: true }, { at: [0, 0] });
    });
    current.update((tx) => {
      tx.history.skip();
      tx.authored.propose();
      tx.nodes.insert(
        {
          type: 'paragraph',
          children: [{ text: 'A proposed paragraph adds the missing detail.' }],
        },
        { at: [1] }
      );
    });
    return current;
  });

  return (
    <EditorRoot
      editor={editor}
      authored={{ intent: 'propose', projection: 'markup' }}
    >
      <SuggestionFormatContent />
    </EditorRoot>
  );
}

function SuggestionFormatContent() {
  return (
    <EditorContainer className="h-[360px]">
      <Toolbar className="border-b px-3 py-1">
        <UndoToolbarButton aria-label="Undo formatting decision" />
        <RedoToolbarButton aria-label="Redo formatting decision" />
        <MarkToolbarButton aria-label="Bold" plugin={BoldPlugin}>
          B
        </MarkToolbarButton>
        <AllCommentsButton />
        <div className="ml-auto">
          <ModeToolbarButton />
        </div>
      </Toolbar>
      <Editor
        aria-label="Formatting suggestions document"
        className="h-auto min-h-[280px] px-8 pb-16 sm:px-12"
        variant="demo"
      />
    </EditorContainer>
  );
}
