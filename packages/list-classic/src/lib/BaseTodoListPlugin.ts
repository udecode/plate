import { createBasePlugin } from '@platejs/core';
import { editorCommands, property, schema, type Element } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { getTodoListItemEntry } from './queries';
import { insertTodoListItem } from './transforms';

export interface TTodoListItemElement extends Element {
  checked?: boolean;
}

export const BaseTodoListPlugin = createBasePlugin({
  key: KEYS.listTodoClassic,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { checked: property.boolean({ default: false }) },
    },
  },
  type: NODES.listTodoClassic,
  options: {
    inheritCheckStateOnLineEndBreak: false,
    inheritCheckStateOnLineStartBreak: false,
  },
})
  .extendExtension(({ editor }) => ({
    commands: ({ around }) => [
      around(editorCommands.insertBreak, ({ state, next }) => {
        let handled = false;
        const prefix = state.transaction((tx) => {
          const selection = tx.selection();

          if (!selection) return;

          const res = getTodoListItemEntry(editor, { at: selection }, tx);

          if (res) handled = insertTodoListItem(editor, tx);
        });

        return handled ? prefix : next.after(prefix);
      }),
    ],
  }))
  .extendTx(({ type }) => (tx) => ({
    toggle: () => tx.nodes.toggle(type),
  }));
