import { createBasePlugin } from '@platejs/core';
import type { Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { getTodoListItemEntry } from './queries';
import { insertTodoListItem } from './transforms';

export interface TTodoListItemElement extends Element {
  checked?: boolean;
}

export const BaseTodoListPlugin = createBasePlugin({
  key: KEYS.listTodoClassic,
  node: { isElement: true },
  options: {
    inheritCheckStateOnLineEndBreak: false,
    inheritCheckStateOnLineStartBreak: false,
  },
})
  .extendExtension(({ editor }) => ({
    transforms: {
      insertBreak({ next, tx }) {
        if (!editor.read.selection()) return next();

        const res = getTodoListItemEntry(editor);

        if (res && insertTodoListItem(editor, tx)) return true;

        return next();
      },
    },
  }))
  .extendTx(({ type }) => (tx) => ({
    toggle: () => tx.nodes.toggle(type),
  }));
