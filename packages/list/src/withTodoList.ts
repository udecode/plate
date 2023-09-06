import { PlateEditor, Value, WithPlatePlugin } from '@udecode/plate-common';

import { deleteBackwardTodoList } from './deleteBackwardTodoList';
import { insertBreakTodoList } from './insertBreakTodoList';
import { TodoListPlugin } from './types';

export const withTodoList = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  { options }: WithPlatePlugin<TodoListPlugin, V, E>
) => {
  const { insertBreak, deleteBackward } = editor;

  editor.insertBreak = () => {
    if (insertBreakTodoList(editor, options)) return;
    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (deleteBackwardTodoList(editor, unit)) return;

    deleteBackward(unit);
  };

  return editor;
};
