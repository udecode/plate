'use client';

import { createEditor, EditorRoot } from 'platejs/react';
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
import { ModeToolbarButton } from '@/registry/components/editor/mode-toolbar-button';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import { TableKit } from '@/registry/components/editor/table';
import { TableToolbarButton } from '@/registry/components/editor/table-toolbar-button';
import { Toolbar } from '@/registry/components/editor/toolbar';
import { UserDirectoryProvider } from '@/registry/components/editor/user-directory';

const demoUsers = {
  alice: { id: 'alice', name: 'Alice' },
  bob: { id: 'bob', name: 'Bob' },
};

export default function SuggestionTableDemo() {
  const [editor] = React.useState(() => {
    const current = createEditor({
      plugins: [
        ...BasicBlocksKit,
        ...BasicMarksKit,
        ...TableKit,
        ...SuggestionKit,
        ...DiscussionKit,
      ],
      userId: 'alice',
      initialValue: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'Review the proposed row, or place the caret in a cell and use the table menu to suggest another row or column.',
            },
          ],
        },
        {
          type: 'table',
          children: [
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  header: true,
                  children: [
                    { type: 'paragraph', children: [{ text: 'Area' }] },
                  ],
                },
                {
                  type: 'tableCell',
                  header: true,
                  children: [
                    { type: 'paragraph', children: [{ text: 'Owner' }] },
                  ],
                },
              ],
            },
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [
                    { type: 'paragraph', children: [{ text: 'Copy' }] },
                  ],
                },
                {
                  type: 'tableCell',
                  children: [
                    { type: 'paragraph', children: [{ text: 'Alice' }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // Fixed IDs render the same on the server and the client.
    current.update((tx) => {
      tx.history.skip();
      tx.authored.propose({ changeId: 'added-table-row' });
      tx.nodes.insert(
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [{ type: 'paragraph', children: [{ text: 'Review' }] }],
            },
            {
              type: 'tableCell',
              children: [{ type: 'paragraph', children: [{ text: 'Bob' }] }],
            },
          ],
        },
        { at: [1, 2] }
      );
    });
    return current;
  });

  return (
    <UserDirectoryProvider initialUsers={demoUsers}>
      <EditorRoot editor={editor} authored={{ intent: 'propose' }}>
        <SuggestionTableContent />
      </EditorRoot>
    </UserDirectoryProvider>
  );
}

function SuggestionTableContent() {
  return (
    <EditorContainer className="h-[400px]">
      <Toolbar className="border-b px-3 py-1">
        <UndoToolbarButton aria-label="Undo table suggestion decision" />
        <RedoToolbarButton aria-label="Redo table suggestion decision" />
        <TableToolbarButton />
        <AllCommentsButton />
        <div className="ml-auto">
          <ModeToolbarButton />
        </div>
      </Toolbar>
      <Editor
        aria-label="Table suggestions document"
        className="h-auto min-h-[260px] ps-[clamp(24px,8%,48px)] pe-13 pb-16"
        variant="demo"
      />
    </EditorContainer>
  );
}
