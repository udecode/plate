import { type TElement, createSlatePlugin, KEYS } from 'platejs';

import { getTodoListItemEntry } from './queries';
import { insertTodoListItem } from './transforms';

export interface TTodoListItemElement extends TElement {
  checked?: boolean;
}

export const BaseTodoListPlugin = createSlatePlugin({
  key: KEYS.listTodoClassic,
  node: { isElement: true },
  options: {
    inheritCheckStateOnLineEndBreak: false,
    inheritCheckStateOnLineStartBreak: false,
  },
})
  .overrideEditor(({ editor, tf: { insertBreak } }) => ({
    transforms: {
      insertBreak() {
        const insertBreakTodoList = () => {
          if (!editor.selection) return;

          const res = getTodoListItemEntry(editor);

          // If selection is in a todo li
          if (res) {
            const inserted = insertTodoListItem(editor);

            if (inserted) return true;
          }
        };

        if (insertBreakTodoList()) return;

        insertBreak();
      },
    },
  }))
  .extendTransforms(({ editor, type }) => ({
    toggle: () => {
      editor.tf.toggleBlock(type);
    },
  }));
