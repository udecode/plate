import type { PlateEditor, Value } from '@udecode/plate-common/server';

import type { TodoListPlugin } from './types';

import { getTodoListItemEntry } from './queries/getTodoListItemEntry';
import { insertTodoListItem } from './transforms/insertTodoListItem';

export const insertBreakTodoList = <V extends Value>(
  editor: PlateEditor<V>,
  options: TodoListPlugin
) => {
  if (!editor.selection) return;

  const res = getTodoListItemEntry(editor);

  // If selection is in a todo li
  if (res) {
    const inserted = insertTodoListItem(editor, options);

    if (inserted) return true;
  }
};
