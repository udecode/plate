import { PlateEditor, Value } from '@udecode/plate-common';
import { getTodoListItemEntry } from './queries/getTodoListItemEntry';
import { insertTodoListItem } from './transforms/insertTodoListItem';
import { TodoListPlugin } from './types';

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
