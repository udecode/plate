'use client';

import { Redo2Icon, Undo2Icon } from 'lucide-react';
import { useEditorHistory } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function RedoToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { canRedo, pending, redo } = useEditorHistory();

  return (
    <ToolbarButton
      {...props}
      aria-busy={pending !== null}
      disabled={!canRedo}
      onClick={redo}
      tooltip="Redo"
    >
      <Redo2Icon className="[&:dir(rtl)]:-scale-x-100" />
    </ToolbarButton>
  );
}

export function UndoToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { canUndo, pending, undo } = useEditorHistory();

  return (
    <ToolbarButton
      {...props}
      aria-busy={pending !== null}
      disabled={!canUndo}
      onClick={undo}
      tooltip="Undo"
    >
      <Undo2Icon className="[&:dir(rtl)]:-scale-x-100" />
    </ToolbarButton>
  );
}
