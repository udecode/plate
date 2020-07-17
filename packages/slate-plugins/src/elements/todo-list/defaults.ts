import { TodoListElement } from './components/TodoListElement';
import { CLASS_TODO_LIST } from './constants';
import { TodoListKeyOption, TodoListPluginOptionsValues } from './types';

export const ELEMENT_TODO_LI = 'action_item';

export const DEFAULTS_TODO_LIST: Record<
  TodoListKeyOption,
  Required<TodoListPluginOptionsValues>
> = {
  todo_li: {
    component: TodoListElement,
    type: ELEMENT_TODO_LI,
    rootProps: {
      className: CLASS_TODO_LIST,
    },
  },
};
