'use client';

import { TabbablePlugin } from '@platejs/tabbable/react';
import { ElementApi, KEYS } from 'platejs';

export const TabbableKit = TabbablePlugin.configure(({ editor }) => ({
  node: {
    isElement: true,
  },
  options: {
    query: () => {
      const isAtEditorEdge = editor.read((state) => {
        const selection = state.selection();

        if (!selection) return false;

        return (
          state.points.isStart(selection.focus, []) ||
          state.points.isEnd(selection.focus, [])
        );
      });

      if (isAtEditorEdge) return false;

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
