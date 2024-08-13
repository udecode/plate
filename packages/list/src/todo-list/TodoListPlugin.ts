import { createPlugin } from '@udecode/plate-common';
import { onKeyDownToggleElement } from '@udecode/plate-common/react';

import type { TodoListPluginOptions } from '../types';

import { withTodoList } from '../withTodoList';


export const TodoListPlugin = createPlugin<
  'action_item',
  TodoListPluginOptions
>({
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
