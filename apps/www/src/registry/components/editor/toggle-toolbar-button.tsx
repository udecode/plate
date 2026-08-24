'use client';

import { BaseTogglePlugin } from '@platejs/toggle';
import { ListCollapseIcon } from 'lucide-react';
import { ElementApi } from 'platejs';
import { useEditor, useEditorSelector } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from './toolbar';

export function ToggleToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const pressed = useEditorSelector((innerEditor) => {
    const selection = innerEditor.read.selection();

    return (
      !!selection &&
      innerEditor.read.nodes.some({ at: selection, type: BaseTogglePlugin })
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
            .flatMap(([, path]) => {
              const key = editor.key(path);

              return key == null ? [] : [key];
            }),
          true
        );
        toggle.update.toggle({ collapse: true });
        editor.api.dom.focus();
      }}
      tooltip="Toggle"
    >
      <ListCollapseIcon />
    </ToolbarButton>
  );
}
