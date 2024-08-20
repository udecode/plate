import type { WithOverride } from '@udecode/plate-common';

import type { TodoListConfig } from './TodoListPlugin';

import { insertBreakTodoList } from './insertBreakTodoList';

export const withTodoList: WithOverride<TodoListConfig> = ({
  editor,
  options,
}) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (insertBreakTodoList(editor, options)) return;

    insertBreak();
  };

  return editor;
};
