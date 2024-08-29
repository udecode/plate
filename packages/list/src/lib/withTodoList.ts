import type { ExtendEditor } from '@udecode/plate-common';

import type { TodoListConfig } from './TodoListPlugin';

import { getTodoListItemEntry } from './queries';
import { insertTodoListItem } from './transforms';

export const withTodoList: ExtendEditor<TodoListConfig> = ({
  editor,
  getOptions,
}) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
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
  };

  return editor;
};
