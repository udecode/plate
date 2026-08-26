'use client';

import { BaseInlineEquationPlugin } from '@platejs/math';
import { RadicalIcon } from 'lucide-react';
import { useEditor } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function InlineEquationToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        editor.plugin(BaseInlineEquationPlugin).update.insert();
      }}
      tooltip="Mark as equation"
    >
      <RadicalIcon />
    </ToolbarButton>
  );
}
