'use client';

import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

export const blockSelectionPlugins = [
  BlockSelectionPlugin.configure(({ editor }) => ({
    // inject: {
    //   excludeBelowPlugins: ['tr'],
    //   excludePlugins: ['table', 'code_line', 'column_group', 'column'],
    // },
    options: {
      enableContextMenu: true,
      isSelectable: (element, path) => {
        if (['code_line', 'column', 'td'].includes(element.type)) {
          return false;
        }

        return (
          path.length === 1 ||
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
