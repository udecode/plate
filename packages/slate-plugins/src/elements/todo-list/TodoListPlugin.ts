import { getOnHotkeyToggleNodeTypeDefault } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { DEFAULTS_TODO_LIST, ELEMENT_TODO_LI } from './defaults';
import { deserializeTodoList } from './deserializeTodoList';
import { renderElementTodoList } from './renderElementTodoList';
import { TodoListPluginOptions } from './types';

export const TodoListPlugin = (
  options?: TodoListPluginOptions
): SlatePlugin => ({
  elementKeys: ELEMENT_TODO_LI,
  renderElement: renderElementTodoList(options),
  deserialize: deserializeTodoList(options),
  onKeyDown: getOnHotkeyToggleNodeTypeDefault({
    key: 'todo_li',
    defaultOptions: DEFAULTS_TODO_LIST,
    options,
  }),
});
