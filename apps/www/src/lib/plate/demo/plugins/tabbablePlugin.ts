import { CodeBlockPlugin } from '@udecode/plate-code-block';
import {
  createSlatePlugin,
  isSelectionAtBlockStart,
  someNode,
} from '@udecode/plate-common';
import { IndentListPlugin } from '@udecode/plate-indent-list';
import { ListItemPlugin } from '@udecode/plate-list';
import { TabbablePlugin } from '@udecode/plate-tabbable';
import { TablePlugin } from '@udecode/plate-table';

import { TabbableElement } from './TabbableElement';

export const tabbablePlugin = TabbablePlugin.extend({
  plugins: [
    createSlatePlugin({
      component: TabbableElement,
      isElement: true,
      isVoid: true,
      key: 'tabbable_element',
    }),
  ],
}).configure(({ editor }) => ({
  options: {
    query: () => {
      if (isSelectionAtBlockStart(editor)) return false;

      return !someNode(editor, {
        match: (n) => {
          return !!(
            n.type &&
            ([
              CodeBlockPlugin.key,
              ListItemPlugin.key,
              TablePlugin.key,
            ].includes(n.type as any) ||
              n[IndentListPlugin.key])
          );
        },
      });
    },
  },
}));
