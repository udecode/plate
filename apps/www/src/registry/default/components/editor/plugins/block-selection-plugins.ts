'use client';

import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

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
  })),
] as const;

export const blockSelectionReadOnlyPlugin = BlockSelectionPlugin.configure({
  api: {},
  extendEditor: null,
  options: {},
  render: {},
  useHooks: null,
  handlers: {},
});
