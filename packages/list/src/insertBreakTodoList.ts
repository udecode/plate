import type { PlateEditor } from '@udecode/plate-common';

import type { TodoListPluginOptions } from './types';

import { getTodoListItemEntry } from './queries/getTodoListItemEntry';
import { insertTodoListItem } from './transforms/insertTodoListItem';

export const insertBreakTodoList = (
  editor: PlateEditor,
  options: TodoListPluginOptions
) => {
  if (!editor.selection) return;

  const res = getTodoListItemEntry(editor);

  // If selection is in a todo li
  if (res) {
    const inserted = insertTodoListItem(editor, options);

    if (inserted) return true;
  }
};
