'use client';

import { PenToolIcon } from 'lucide-react';
import { InkPlugin } from 'platejs/ink/react';
import { useEditor, useEditorReadOnly, useViewStore } from 'platejs/react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

const PEN = {
  brush: { color: '#2563eb', opacity: 1, size: 2.5 },
  type: 'draw',
} as const;

export function DrawToolbarButton() {
  const editor = useEditor();
  const tool = useViewStore(InkPlugin, (state) => state.tool);
  const readOnly = useEditorReadOnly();

  return (
    <ToolbarButton
      disabled={readOnly}
      onClick={() => editor.plugin(InkPlugin).api.setTool(tool ? null : PEN)}
      pressed={tool !== null}
      tooltip="Draw"
    >
      <PenToolIcon />
    </ToolbarButton>
  );
}
