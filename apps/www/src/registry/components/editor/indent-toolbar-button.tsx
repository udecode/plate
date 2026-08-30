'use client';

import { IndentIcon, OutdentIcon } from 'lucide-react';
import { IndentPlugin, useEditorPlugin } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function IndentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { update } = useEditorPlugin(IndentPlugin);

  return (
    <ToolbarButton
      {...props}
      tooltip="Indent"
      onClick={() => {
        update.increase();
      }}
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
      onClick={() => {
        update.decrease();
      }}
    >
      <OutdentIcon />
    </ToolbarButton>
  );
}
