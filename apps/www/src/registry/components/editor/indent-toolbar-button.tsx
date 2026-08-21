'use client';

import { IndentPlugin } from '@platejs/indent/react';
import { IndentIcon, OutdentIcon } from 'lucide-react';
import { useEditorPlugin } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from './toolbar';

export function IndentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { update } = useEditorPlugin(IndentPlugin);

  return (
    <ToolbarButton
      {...props}
      tooltip="Indent"
      onClick={() => update.increase()}
      onMouseDown={(event) => event.preventDefault()}
    >
      <IndentIcon />
    </ToolbarButton>
  );
}

export function OutdentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { update } = useEditorPlugin(IndentPlugin);

  return (
    <ToolbarButton
      {...props}
      tooltip="Outdent"
      onClick={() => update.decrease()}
      onMouseDown={(event) => event.preventDefault()}
    >
      <OutdentIcon />
    </ToolbarButton>
  );
}
