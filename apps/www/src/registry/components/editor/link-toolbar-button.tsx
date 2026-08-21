'use client';

import { Link } from 'lucide-react';
import { useEditor, useEditorPlugin, useEditorSelector } from 'platejs/react';
import * as React from 'react';

import { linkPlugin } from './link';
import { ToolbarButton } from './toolbar';

export function LinkToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const { api } = useEditorPlugin(linkPlugin);
  const pressed = useEditorSelector((editor) => {
    const selection = editor.read.selection();

    return (
      !!selection && editor.read.nodes.some({ at: selection, type: linkPlugin })
    );
  });

  return (
    <ToolbarButton
      {...props}
      pressed={pressed}
      onClick={() => {
        if (pressed) {
          const selection = editor.read.selection();

          if (!selection) return;

          const node = editor.read.nodes.find({
            at: selection,
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
      onMouseDown={(event) => event.preventDefault()}
      data-plate-focus
      tooltip="Link"
    >
      <Link />
    </ToolbarButton>
  );
}
