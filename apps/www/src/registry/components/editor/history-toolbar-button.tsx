'use client';

import { Redo2Icon, Undo2Icon } from 'lucide-react';
import { useEditor, useEditorHistory } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function RedoToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { canRedo, pending, redo } = useEditorHistory({ editor: useEditor() });

  return (
    <ToolbarButton
      aria-label="Redo"
      {...props}
      aria-busy={pending !== null}
      disabled={!canRedo}
      onClick={redo}
      tooltip="Redo"
    >
      <Redo2Icon />
    </ToolbarButton>
  );
}

export function UndoToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { canUndo, pending, undo } = useEditorHistory({ editor: useEditor() });

  return (
    <ToolbarButton
      aria-label="Undo"
      {...props}
      aria-busy={pending !== null}
      disabled={!canUndo}
      onClick={undo}
      tooltip="Undo"
    >
      <Undo2Icon />
    </ToolbarButton>
  );
}
