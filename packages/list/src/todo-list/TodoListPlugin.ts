import {
  type HotkeyPluginOptions,
  type PluginConfig,
  createTSlatePlugin,
} from '@udecode/plate-common';
import { onKeyDownToggleElement } from '@udecode/plate-common/react';

import { withTodoList } from '../withTodoList';

export type TodoListConfig = PluginConfig<
  'action_item',
  {
    inheritCheckStateOnLineEndBreak?: boolean;
    inheritCheckStateOnLineStartBreak?: boolean;
  } & HotkeyPluginOptions
>;

export const TodoListPlugin = createTSlatePlugin<TodoListConfig>({
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  isElement: true,
  key: 'action_item',
  options: {
    hotkey: ['mod+opt+4', 'mod+shift+4'],
  },
  withOverrides: withTodoList,
});
