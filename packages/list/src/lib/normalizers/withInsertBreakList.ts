import type { PlateEditorExtension } from '@platejs/core';
import { editorCommands, type Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const withInsertBreakList = (): PlateEditorExtension => ({
  commands: ({ around }) => [
    around(editorCommands.insertBreak, ({ state, next }) => {
      const nodeEntry = state.nodes.block<Element>();

      if (!nodeEntry) return false;

      const [node, path] = nodeEntry;
      const selection = state.selection();

      if (
        node[KEYS.listType] !== KEYS.listTodo ||
        !selection ||
        state.selection.isExpanded() ||
        !state.points.isEnd(selection.focus, path)
      ) {
        return false;
      }

      const result = next();

      if (result === false) return false;

      return state.transaction.extend(result, (tx) => {
        const newEntry = tx.nodes.above<Element>();

        if (newEntry) {
          tx.nodes.set({ checked: false }, { at: newEntry[1] });
        }
      });
    }),
  ],
  priority: 100,
});
