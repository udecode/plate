'use client';

import * as React from 'react';

import { BaseTogglePlugin } from '@platejs/toggle';
import { ElementApi } from 'platejs';
import { useEditor, useEditorSelector } from 'platejs/react';
import { ListCollapseIcon } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function ToggleToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const pressed = useEditorSelector((editor) => {
    const selection = editor.read.selection();

    return (
      !!selection &&
      editor.read.nodes.some({ at: selection, type: BaseTogglePlugin })
    );
  });

  return (
    <ToolbarButton
      {...props}
      pressed={pressed}
      onClick={() => {
        const toggle = editor.plugin(BaseTogglePlugin);

        toggle.api.toggleKeys(
          editor.read.nodes
            .toArray({
              match: (node) =>
                ElementApi.isElement(node) && editor.read.nodes.isBlock(node),
              mode: 'lowest',
            })
            .map(([, path]) => editor.key(path)!),
          true
        );
        toggle.update.toggle({ collapse: true });
        editor.api.dom.focus();
      }}
      onMouseDown={(event) => event.preventDefault()}
      tooltip="Toggle"
    >
      <ListCollapseIcon />
    </ToolbarButton>
  );
}
