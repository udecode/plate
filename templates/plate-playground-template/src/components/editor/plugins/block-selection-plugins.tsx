'use client';

import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

import { BlockSelection } from '@/components/plate-ui/block-selection';

export const blockSelectionPlugins = [
  BlockSelectionPlugin.configure(({ editor }) => ({
    options: {
      enableContextMenu: true,
      isSelectable: (element, path) => {
        return (
          !['code_line', 'column', 'td'].includes(element.type) &&
          !editor.api.block({ above: true, at: path, match: { type: 'tr' } })
        );
      },
    },
    render: {
      belowRootNodes: (props) => {
        if (!props.className?.includes('slate-selectable')) return null;

        return <BlockSelection />;
      },
    },
  })),
] as const;

export const blockSelectionReadOnlyPlugin = BlockSelectionPlugin.configure({
  api: {},
  extendEditor: null,
  handlers: {},
  options: {},
  render: {},
  useHooks: null,
});
