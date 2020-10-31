import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getOnHotkeyToggleNodeTypeDefault } from '../../common/utils/getOnHotkeyToggleNodeTypeDefault';
import { DEFAULTS_TODO_LIST } from './defaults';
import { deserializeTodoList } from './deserializeTodoList';
import { renderElementTodoList } from './renderElementTodoList';
import { TodoListPluginOptions } from './types';

export const TodoListPlugin = (
  options?: TodoListPluginOptions
): SlatePlugin => ({
  renderElement: renderElementTodoList(options),
  deserialize: deserializeTodoList(options),
  onKeyDown: getOnHotkeyToggleNodeTypeDefault({
    key: 'todo_li',
    defaultOptions: DEFAULTS_TODO_LIST,
    options,
  }),
});
