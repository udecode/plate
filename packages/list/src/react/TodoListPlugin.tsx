import { Key, toTPlatePlugin } from '@udecode/plate/react';

import {
  type TodoListConfig,
  BaseTodoListPlugin,
} from '../lib/BaseTodoListPlugin';

/** Enables support for todo lists with React-specific features. */
export const TodoListPlugin = toTPlatePlugin<TodoListConfig>(
  BaseTodoListPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleTodoList: {
        keys: [
          [Key.Mod, Key.Alt, '4'],
          [Key.Mod, Key.Shift, '4'],
        ],
        preventDefault: true,
        handler: () => {
          editor.tf.toggleBlock(type);
        },
      },
    },
  })
);
