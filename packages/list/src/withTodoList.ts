import type { WithOverride } from '@udecode/plate-common';

import type { TodoListPluginOptions } from './types';

import { insertBreakTodoList } from './insertBreakTodoList';

export const withTodoList: WithOverride<TodoListPluginOptions> = ({
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
