import type { SlateEditor } from '@udecode/plate-common';

import type { TodoListConfig } from './todo-list';

import { getTodoListItemEntry } from './queries/getTodoListItemEntry';
import { insertTodoListItem } from './transforms/insertTodoListItem';

export const insertBreakTodoList = (
  editor: SlateEditor,
  options: TodoListConfig['options']
) => {
  if (!editor.selection) return;

  const res = getTodoListItemEntry(editor);

  // If selection is in a todo li
  if (res) {
    const inserted = insertTodoListItem(editor, options);

    if (inserted) return true;
  }
};
