'use client';

import { AIChatPlugin } from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { type TElement, getPluginTypes, isHotkey, KEYS } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import { BlockSelection } from '@/registry/ui/block-selection';

export const BlockSelectionKit = [
  BlockSelectionPlugin.configure(({ editor }: { editor: PlateEditor }) => ({
    options: {
      enableContextMenu: true,
      isSelectable: (element: TElement) =>
        !getPluginTypes(editor, [KEYS.column, KEYS.codeLine, KEYS.td]).includes(
          element.type
        ),
      onKeyDownSelecting: (
        editor: PlateEditor,
        e: React.KeyboardEvent<HTMLDivElement>
      ) => {
        if (isHotkey('mod+j')(e)) {
          editor.getApi(AIChatPlugin).aiChat.show();
        }
      },
    },
    render: {
      belowRootNodes: (props: React.ComponentProps<typeof BlockSelection>) => {
        if (!props.attributes.className?.includes('slate-selectable'))
          return null;

        return <BlockSelection {...props} />;
      },
    },
  })),
];
