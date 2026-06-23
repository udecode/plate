'use client';

import * as React from 'react';

import { Redo2Icon, Undo2Icon } from 'lucide-react';
import { useSlateHistory } from 'platejs/react';

import { ToolbarButton } from './toolbar';

export function RedoToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { canRedo, redo } = useSlateHistory();

  return (
    <ToolbarButton
      {...props}
      disabled={!canRedo}
      onClick={redo}
      onMouseDown={(e) => e.preventDefault()}
      tooltip="Redo"
    >
      <Redo2Icon />
    </ToolbarButton>
  );
}

export function UndoToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { canUndo, undo } = useSlateHistory();

  return (
    <ToolbarButton
      {...props}
      disabled={!canUndo}
      onClick={undo}
      onMouseDown={(e) => e.preventDefault()}
      tooltip="Undo"
    >
      <Undo2Icon />
    </ToolbarButton>
  );
}
