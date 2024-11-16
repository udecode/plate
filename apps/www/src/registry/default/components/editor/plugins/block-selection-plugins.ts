'use client';

import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

export const blockSelectionPlugins = [
  BlockSelectionPlugin.configure({
    inject: {
      excludeBelowPlugins: ['tr'],
      excludePlugins: ['table', 'code_line', 'column_group', 'column'],
    },
    options: {
      enableContextMenu: true,
    },
  }),
] as const;

export const blockSelectionReadOnlyPlugin = BlockSelectionPlugin.configure({
  api: {},
  extendEditor: null,
  options: {},
  render: {},
  useHooks: null,
  handlers: {},
});
