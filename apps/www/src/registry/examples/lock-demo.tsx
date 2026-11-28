'use client';

import { LockIcon, LockOpenIcon, SparklesIcon } from 'lucide-react';
import { BaseLockPlugin } from 'platejs/lock';
import { useIsLocked, useIsOwnLocked } from 'platejs/lock/react';
import { EditorRoot, useCreateEditor, useEditor } from 'platejs/react';

import { AIKit } from '@/registry/components/editor/ai';
import { AIToolbarButton } from '@/registry/components/editor/ai-toolbar-button';
import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { BlockMenuKit } from '@/registry/components/editor/block-menu';
import { DndKit } from '@/registry/components/editor/dnd';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { FieldKit } from '@/registry/components/editor/field';
import { ListKit } from '@/registry/components/editor/list';
import { LockKit } from '@/registry/components/editor/lock';
import { MarkdownKit } from '@/registry/components/editor/markdown';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import { TableKit } from '@/registry/components/editor/table';
import { Toolbar, ToolbarButton } from '@/registry/components/editor/toolbar';
import { lockValue } from '@/registry/examples/values/lock-value';

function LockToolbar() {
  const editor = useEditor();
  const locked = useIsLocked();
  const ownLocked = useIsOwnLocked();
  const inheritedLock = locked && !ownLocked;

  return (
    <Toolbar className="gap-1 border-b px-2 py-1">
      <ToolbarButton
        aria-label={
          inheritedLock
            ? 'Locked by parent'
            : ownLocked
              ? 'Unlock block'
              : 'Lock block'
        }
        disabled={inheritedLock}
        pressed={ownLocked}
        tooltip={
          inheritedLock
            ? 'Locked by parent block'
            : ownLocked
              ? 'Unlock selected block'
              : 'Lock selected block'
        }
        onClick={() => {
          editor.update((tx) => {
            tx.plugin(BaseLockPlugin).toggle();
          });
        }}
      >
        {ownLocked ? (
          <>
            <LockOpenIcon className="size-4" />
            <span>Unlock block</span>
          </>
        ) : (
          <>
            <LockIcon className="size-4" />
            <span>{inheritedLock ? 'Locked by parent' : 'Lock block'}</span>
          </>
        )}
      </ToolbarButton>

      <AIToolbarButton aria-label="Ask AI" tooltip="Ask AI (⌘J)">
        <SparklesIcon className="size-4" />
        <span>Ask AI</span>
      </AIToolbarButton>
    </Toolbar>
  );
}

export default function LockDemo() {
  const editor = useCreateEditor({
    initialValue: lockValue,
    plugins: [
      ...AIKit,
      ...BasicNodesKit,
      ...TableKit,
      ...ListKit,
      ...SuggestionKit,
      ...MarkdownKit,
      ...FieldKit,
      ...DndKit,
      ...BlockMenuKit,
      ...LockKit,
    ],
  });

  return (
    <EditorRoot authored={{ intent: 'edit' }} editor={editor}>
      <EditorFrame className="h-[540px]">
        <LockToolbar />
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
