'use client';

import { TabbablePlugin } from '@platejs/tabbable/react';
import { ElementApi, getPluginTypes, KEYS } from 'platejs';

export const TabbableKit = TabbablePlugin.extend({
  override: {
    enabled: {
      indent: false,
    },
  },
}).configure(({ editor }) => ({
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
              getPluginTypes(editor, [
                KEYS.codeBlock,
                KEYS.li,
                KEYS.listTodoClassic,
                KEYS.table,
              ]).includes(n.type)) ||
            (ElementApi.isElement(n) && n.listStyleType)
          ),
      });
    },
  },
}));
