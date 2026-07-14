import type { ExtendPlateEditorExtension } from '@platejs/core';
import type { Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { BaseListConfig } from '../BaseListPlugin';

export const withInsertBreakList: ExtendPlateEditorExtension<
  BaseListConfig
> = () => ({
  priority: 100,
  transforms: {
    insertBreak({ next, tx }) {
      const nodeEntry = tx.nodes.block<Element>();

      if (!nodeEntry) return next();

      const [node, path] = nodeEntry;
      const selection = tx.selection();

      if (
        node[KEYS.listType] !== KEYS.listTodo ||
        !selection ||
        tx.selection.isExpanded() ||
        !tx.points.isEnd(selection.focus, path)
      ) {
        return next();
      }

      next();

      const newEntry = tx.nodes.above<Element>();

      if (newEntry) {
        tx.nodes.set({ checked: false }, { at: newEntry[1] });
      }

      return true;
    },
  },
});
