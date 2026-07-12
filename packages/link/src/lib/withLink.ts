import type { ExtendPlateEditorExtension } from '@platejs/core';
import type { Element } from '@platejs/plite';
import { PathApi } from '@platejs/plite';

import type { BaseLinkConfig } from './BaseLinkPlugin';

/** Moves text insertion outside a link when the caret is at its end. */
export const withLink: ExtendPlateEditorExtension<BaseLinkConfig> = ({
  type,
}) => ({
  transforms: {
    insertText({ next, options, text, tx }) {
      if (options?.at) return next({ options, text });

      const selection = tx.selection();

      if (!selection || !tx.selection.isCollapsed()) {
        return next({ options, text });
      }

      const link = tx.nodes.above<Element>({
        at: selection,
        match: { type },
      });

      if (!link || !tx.points.isEnd(selection.focus, link[1])) {
        return next({ options, text });
      }

      const nextPoint = tx.points.after(link[1]);

      if (nextPoint) {
        tx.selection.set(nextPoint);
      } else {
        const nextPath = PathApi.next(link[1]);

        tx.nodes.insert({ text: '' }, { at: nextPath });
        tx.selection.set({ offset: 0, path: nextPath });
      }

      return next({ options, text });
    },
  },
});
