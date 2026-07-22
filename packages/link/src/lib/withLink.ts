import type { PlateEditorExtension } from '@platejs/core';
import {
  editorCommands,
  type Element,
  ElementApi,
  PathApi,
} from '@platejs/plite';

/** Moves text insertion outside a link when the caret is at its end. */
export const withLink = ({ type }: { type: string }): PlateEditorExtension => ({
  commands: ({ around }) => [
    around(editorCommands.insertText, ({ input, state, next }) => {
      if (input.options?.at) return next();

      const selection = state.selection();

      if (!selection || !state.selection.isCollapsed()) {
        return next();
      }

      const link = state.nodes.above<Element>({
        at: selection,
        match: { type },
      });

      if (!link || !state.points.isEnd(selection.focus, link[1])) {
        return next();
      }

      const nextPoint = state.points.after(link[1]);
      const prefix = state.transaction((tx) => {
        if (nextPoint) {
          tx.selection.set(nextPoint);
        } else {
          const nextPath = PathApi.next(link[1]);

          tx.nodes.insert({ text: '' }, { at: nextPath });
          tx.selection.set({ offset: 0, path: nextPath });
        }
      });

      return next.after(prefix);
    }),
  ],
  corrections: [
    {
      event: 'content',
      correct({ entry: [node, path], tx }) {
        if (
          ElementApi.isElement(node) &&
          node.type === type &&
          tx.text.string(path).length === 0
        ) {
          tx.nodes.remove({ at: path });
        }
      },
    },
  ],
});
