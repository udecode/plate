'use client';

import { TabbablePlugin } from '@platejs/tabbable/react';
import { KEYS } from 'platejs';

export const TabbableKit = TabbablePlugin.configure(({ editor }) => ({
  node: {
    isElement: true,
  },
  options: {
    query: () => {
      if (editor.api.isAt({ start: true }) || editor.api.isAt({ end: true }))
        return false;

      return !editor.api.some({
        match: (n) =>
          !!(
            (n.type &&
              [
                KEYS.codeBlock,
                KEYS.li,
                KEYS.listTodoClassic,
                KEYS.table,
              ].includes(n.type as any)) ||
            n.listStyleType
          ),
      });
    },
  },
  override: {
    enabled: {
      indent: false,
    },
  },
}));
