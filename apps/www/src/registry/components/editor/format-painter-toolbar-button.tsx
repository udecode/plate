'use client';

import { PaintbrushIcon } from 'lucide-react';
import { FormatPainterPlugin } from 'platejs/format-painter/react';
import { useEditor, useEditorReadOnly, useViewStore } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function FormatPainterToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();

  if (!editor.plugin(FormatPainterPlugin).installed) {
    return (
      <ToolbarButton tooltip="Paint format" {...props} disabled>
        <PaintbrushIcon />
      </ToolbarButton>
    );
  }

  return <MountedFormatPainterToolbarButton {...props} />;
}

function MountedFormatPainterToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const armed = useViewStore(FormatPainterPlugin, (state) => state.armed);
  const painter = editor.plugin(FormatPainterPlugin);

  return (
    <ToolbarButton
      tooltip="Paint format"
      {...props}
      disabled={props.disabled || (readOnly && armed === 'off')}
      pressed={armed !== 'off'}
      onClick={(event) => {
        if (event.detail >= 2) painter.api.arm({ sticky: true });
        else if (armed === 'off') painter.api.arm();
        else painter.api.disarm();
      }}
    >
      <PaintbrushIcon />
    </ToolbarButton>
  );
}
