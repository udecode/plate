'use client';

import { ListCollapseIcon } from 'lucide-react';
import { PathApi } from 'platejs';
import { BaseDetailsPlugin } from 'platejs/details';
import { useEditor, useEditorSelector } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function DetailsToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const { disabled, pressed } = useEditorSelector((innerEditor) => {
    const selection = innerEditor.read.selection();
    const isActive =
      !!selection &&
      !!innerEditor.read.nodes.above({
        at: selection,
        type: BaseDetailsPlugin,
      });
    const leafEntries = innerEditor.read.nodes.blocks({ mode: 'lowest' });
    const hasContainerNodeSelection = innerEditor.read.selection
      .nodes()
      .some(([, selectedPath]) =>
        leafEntries.some(([, path]) => PathApi.isAncestor(selectedPath, path))
      );

    return {
      disabled: hasContainerNodeSelection && !isActive,
      pressed: isActive,
    };
  });

  return (
    <ToolbarButton
      {...props}
      disabled={props.disabled || disabled}
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
