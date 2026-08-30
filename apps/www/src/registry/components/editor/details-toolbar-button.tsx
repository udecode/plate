'use client';

import { ListCollapseIcon } from 'lucide-react';
import { BaseDetailsPlugin } from 'platejs/details';
import { useEditor, useEditorSelector } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function DetailsToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const pressed = useEditorSelector((innerEditor) => {
    const selection = innerEditor.read.selection();

    return (
      !!selection &&
      !!innerEditor.read.nodes.above({
        at: selection,
        type: BaseDetailsPlugin,
      })
    );
  });

  return (
    <ToolbarButton
      {...props}
      pressed={pressed}
      tooltip="Details"
      onClick={() => {
        const details = editor.plugin(BaseDetailsPlugin);

        if (pressed) {
          details.update.unwrap();
        } else {
          details.update.wrap();
        }

        editor.api.dom.focus();
      }}
    >
      <ListCollapseIcon data-icon />
    </ToolbarButton>
  );
}
