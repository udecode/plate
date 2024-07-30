import type { WithOverride } from '@udecode/plate-common/server';

import type { TodoListPluginOptions } from './types';

import { insertBreakTodoList } from './insertBreakTodoList';

export const withTodoList: WithOverride<TodoListPluginOptions> = (
  editor,
  { options }
) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (insertBreakTodoList(editor, options)) return;

    insertBreak();
  };

  return editor;
};
