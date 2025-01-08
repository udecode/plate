import type { ExtendEditorTransforms } from '@udecode/plate';

import type { TodoListConfig } from './BaseTodoListPlugin';

import { getTodoListItemEntry } from './queries';
import { insertTodoListItem } from './transforms';

export const withTodoList: ExtendEditorTransforms<TodoListConfig> = ({
  editor,
  getOptions,
  tf: { insertBreak },
}) => ({
  insertBreak() {
    const insertBreakTodoList = () => {
      if (!editor.selection) return;

      const res = getTodoListItemEntry(editor);

      // If selection is in a todo li
      if (res) {
        const inserted = insertTodoListItem(editor, getOptions());

        if (inserted) return true;
      }
    };

    if (insertBreakTodoList()) return;

    insertBreak();
  },
});
