import { PlateEditor, Value, WithPlatePlugin } from '@udecode/plate-common';
import { insertBreakTodoList } from './insertBreakTodoList';
import { TodoListPlugin } from './types';

export const withTodoList = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options }: WithPlatePlugin<TodoListPlugin, V, E>
) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (insertBreakTodoList(editor, options)) return;
    insertBreak();
  };

  return editor;
};
