'use client';

import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import { TablePlugin } from '@udecode/plate-table/react';

export const tabbablePlugin = TabbablePlugin.configure(({ editor }) => ({
  node: {
    isElement: true,
  },
  options: {
    query: () => {
      if (editor.api.isAt({ start: true }) || editor.api.isAt({ end: true }))
        return false;

      return !editor.api.some({
        match: (n) => {
          return !!(
            n.type &&
            ([
              CodeBlockPlugin.key,
              TablePlugin.key,
              'action_item',
              'li',
            ].includes(n.type as string) ||
              n.listStyleType)
          );
        },
      });
    },
  },
  override: {
    enabled: {
      indent: false,
    },
  },
}));
