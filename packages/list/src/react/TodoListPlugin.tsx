import type { ExtendConfig, HotkeyPluginOptions } from '@udecode/plate-common';

import {
  onKeyDownToggleElement,
  toTPlatePlugin,
} from '@udecode/plate-common/react';

import {
  type TodoListConfig as BaseTodoListConfig,
  TodoListPlugin as BaseTodoListPlugin,
} from '../lib/TodoListPlugin';

export type TodoListConfig = ExtendConfig<
  BaseTodoListConfig,
  HotkeyPluginOptions
>;

/** Enables support for todo lists with React-specific features. */
export const TodoListPlugin = toTPlatePlugin<TodoListConfig>(
  BaseTodoListPlugin,
  {
    handlers: {
      onKeyDown: onKeyDownToggleElement,
    },
    options: {
      hotkey: ['mod+opt+4', 'mod+shift+4'],
    },
  }
);
