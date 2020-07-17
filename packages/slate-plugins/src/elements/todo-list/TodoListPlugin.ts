import { SlatePlugin } from '@udecode/slate-plugins-core';
import { deserializeTodoList } from './deserializeTodoList';
import { renderElementTodoList } from './renderElementTodoList';
import { TodoListPluginOptions } from './types';

export const TodoListPlugin = (
  options?: TodoListPluginOptions
): SlatePlugin => ({
  renderElement: renderElementTodoList(options),
  deserialize: deserializeTodoList(options),
});
