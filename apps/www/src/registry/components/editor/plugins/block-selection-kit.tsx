'use client';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import { AIChatPlugin } from '@platejs/ai/react';
import { PLUGINS, isHotkey } from 'platejs';

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
        ![PLUGINS.column, PLUGINS.codeLine, PLUGINS.tableCell]
          .flatMap((name) => {
            const plugin = editor.plugin(name);

            return plugin.installed ? [plugin.schema.type] : [];
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
