'use client';

import { Link } from 'lucide-react';
import { useEditor, useEditorPlugin, useEditorSelector } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

import { linkPlugin } from './link';

export function LinkToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const { api } = useEditorPlugin(linkPlugin);
  const pressed = useEditorSelector((innerEditor) => {
    const selection = innerEditor.read.selection();

    return !!selection && innerEditor.read.nodes.some({ type: linkPlugin });
  });

  return (
    <ToolbarButton
      {...props}
      pressed={pressed}
      onClick={() => {
        if (pressed) {
          if (!editor.read.selection()) return;

          const node = editor.read.nodes.find({
            type: linkPlugin,
          });

          if (!node) return;

          const endPoint = editor.read.points.end(node[1]);

          if (endPoint) editor.update.selection.set(endPoint);
        } else {
          editor.api.dom.focus();
          api.trigger({ focused: true });
        }
      }}
      data-plate-focus
      tooltip="Link"
    >
      <Link />
    </ToolbarButton>
  );
}
