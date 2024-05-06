import {
  createPluginFactory,
  onKeyDownToggleElement,
} from '@udecode/plate-common/server';

import type { TodoListPlugin } from '../types';

import { withTodoList } from '../withTodoList';

export const ELEMENT_TODO_LI = 'action_item';

export const createTodoListPlugin = createPluginFactory<TodoListPlugin>({
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  isElement: true,
  key: ELEMENT_TODO_LI,
  options: {
    hotkey: ['mod+opt+4', 'mod+shift+4'],
  },
  withOverrides: withTodoList,
});
