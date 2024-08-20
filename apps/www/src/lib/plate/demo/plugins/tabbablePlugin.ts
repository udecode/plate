import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { isSelectionAtBlockStart, someNode } from '@udecode/plate-common';
import { createPlatePlugin } from '@udecode/plate-common/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { ListItemPlugin } from '@udecode/plate-list/react';
import { TabbablePlugin } from '@udecode/plate-tabbable';
import { TablePlugin } from '@udecode/plate-table/react';

import { TabbableElement } from './TabbableElement';

export const tabbablePlugin = TabbablePlugin.extend({
  plugins: [
    createPlatePlugin({
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
