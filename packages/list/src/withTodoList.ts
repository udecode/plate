import type {
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';

import type { TodoListPlugin } from './types';

import { insertBreakTodoList } from './insertBreakTodoList';

export const withTodoList = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
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
