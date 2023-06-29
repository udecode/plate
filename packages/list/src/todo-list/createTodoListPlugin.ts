import {
  createPluginFactory,
  onKeyDownToggleElement,
} from '@udecode/plate-common';

import { TodoListPlugin } from '../types';
import { withTodoList } from '../withTodoList';

export const ELEMENT_TODO_LI = 'action_item';

export const createTodoListPlugin = createPluginFactory<TodoListPlugin>({
  key: ELEMENT_TODO_LI,
  isElement: true,
  withOverrides: withTodoList,
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  options: {
    hotkey: ['mod+opt+4', 'mod+shift+4'],
  },
});
