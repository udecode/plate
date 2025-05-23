'use client';

import { KEYS } from '@udecode/plate';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';

export const TabbableKit = TabbablePlugin.configure(({ editor }) => ({
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
            (n.type &&
              [
                KEYS.codeBlock,
                KEYS.liClassic,
                KEYS.listTodoClassic,
                KEYS.table,
              ].includes(n.type as any)) ||
            n.listStyleType
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
