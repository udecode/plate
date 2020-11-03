import { TodoListElement } from './components/TodoListElement';
import { CLASS_TODO_LIST } from './constants';
import { TodoListKeyOption, TodoListPluginOptionsValues } from './types';

export const ELEMENT_TODO_LI = 'action_item';

export const DEFAULTS_TODO_LIST: Record<
  TodoListKeyOption,
  TodoListPluginOptionsValues
> = {
  todo_li: {
    component: TodoListElement,
    type: ELEMENT_TODO_LI,
    hotkey: ['mod+opt+4', 'mod+shift+4'],
    rootProps: {
      className: CLASS_TODO_LIST,
    },
  },
};
