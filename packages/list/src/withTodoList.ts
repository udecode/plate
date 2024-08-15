import type { WithOverride } from '@udecode/plate-common';

import type { TodoListConfig } from './todo-list';

import { insertBreakTodoList } from './insertBreakTodoList';

export const withTodoList: WithOverride<TodoListConfig> = ({
  editor,
  plugin: { options },
}) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (insertBreakTodoList(editor, options)) return;

    insertBreak();
  };

  return editor;
};
