import { CodeBlockPlugin } from '@udecode/plate-code-block';
import {
  createPlugin,
  isSelectionAtBlockStart,
  someNode,
} from '@udecode/plate-common';
import { IndentListPlugin } from '@udecode/plate-indent-list';
import { ListItemPlugin } from '@udecode/plate-list';
import { TabbablePlugin as TabbableBasePlugin } from '@udecode/plate-tabbable';
import { TablePlugin } from '@udecode/plate-table';

import { TabbableElement } from './TabbableElement';

export const TabbablePlugin = TabbableBasePlugin.extend({
  plugins: [
    createPlugin({
      component: TabbableElement,
      isElement: true,
      isVoid: true,
      key: 'tabbable_element',
    }),
  ],
}).configure(({ editor }) => ({
  query: () => {
    if (isSelectionAtBlockStart(editor)) return false;

    return !someNode(editor, {
      match: (n) => {
        return !!(
          n.type &&
          ([CodeBlockPlugin.key, ListItemPlugin.key, TablePlugin.key].includes(
            n.type as any
          ) ||
            n[IndentListPlugin.key])
        );
      },
    });
  },
}));
