'use client';

import { TabbablePlugin } from '@platejs/tabbable/react';
import { ElementApi, KEYS } from 'platejs';

export const TabbableKit = TabbablePlugin.configure(({ editor }) => ({
  node: {
    isElement: true,
  },
  options: {
    query: () => {
      if (
        editor.read.selection.isAtBlockStart() ||
        editor.read.selection.isAtBlockEnd()
      ) {
        return false;
      }

      return !editor.read.nodes.some({
        match: (n) =>
          !!(
            (ElementApi.isElement(n) &&
              [KEYS.codeBlock, KEYS.li, KEYS.listTodoClassic, KEYS.table].some(
                (type) => type === n.type
              )) ||
            (ElementApi.isElement(n) && n.listStyleType)
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
