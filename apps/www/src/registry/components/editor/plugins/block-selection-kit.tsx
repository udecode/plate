'use client';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import { AIChatPlugin } from '@platejs/ai/react';
import { isHotkey, KEYS } from 'platejs';

import { BlockSelection } from '@/registry/ui/block-selection';

export const hasSelectableClass = ({
  attributes,
  className,
}: {
  attributes: { className?: string };
  className?: string;
}) =>
  [className, attributes.className]
    .filter(Boolean)
    .join(' ')
    .includes('plite-selectable');

export const BlockSelectionKit = [
  BlockSelectionPlugin.configure(({ editor }) => ({
    initialState: {
      enableContextMenu: true,
      isSelectable: (element) =>
        ![KEYS.column, KEYS.codeLine, KEYS.td]
          .map((name) => {
            const plugin = editor.plugin(name);

            return plugin.installed ? plugin.type : name;
          })
          .includes(element.type),
      onKeyDownSelecting: (editor, e) => {
        if (isHotkey('mod+j')(e)) {
          editor.plugin(AIChatPlugin).api.show();
        }
      },
    },
    render: {
      belowRootNodes: (props) => {
        if (!hasSelectableClass(props)) return null;

        return <BlockSelection {...props} />;
      },
    },
  })),
];
