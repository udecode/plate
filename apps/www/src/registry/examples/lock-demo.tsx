'use client';

import { LockIcon, LockOpenIcon } from 'lucide-react';
import { BaseLockPlugin } from 'platejs/lock';
import { useIsLocked, useIsOwnLocked } from 'platejs/lock/react';
import { EditorRoot, useCreateEditor, useEditor } from 'platejs/react';

import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { BlockMenuKit } from '@/registry/components/editor/block-menu';
import { DndKit } from '@/registry/components/editor/dnd';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { FieldKit } from '@/registry/components/editor/field';
import { LockKit } from '@/registry/components/editor/lock';
import { Toolbar, ToolbarButton } from '@/registry/components/editor/toolbar';
import { lockValue } from '@/registry/examples/values/lock-value';

function LockToolbar() {
  const editor = useEditor();
  const locked = useIsLocked();
  const ownLocked = useIsOwnLocked();
  const inheritedLock = locked && !ownLocked;

  return (
    <Toolbar className="border-b px-2 py-1">
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
    </Toolbar>
  );
}

export default function LockDemo() {
  const editor = useCreateEditor({
    initialValue: lockValue,
    plugins: [
      ...BasicNodesKit,
      ...FieldKit,
      ...DndKit,
      ...BlockMenuKit,
      ...LockKit,
    ],
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame className="h-[460px]">
        <LockToolbar />
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
