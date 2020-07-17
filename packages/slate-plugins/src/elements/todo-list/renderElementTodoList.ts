import { getRenderElement } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_TODO_LIST } from './defaults';
import { TodoListRenderElementOptions } from './types';

export const renderElementTodoList = (
  options?: TodoListRenderElementOptions
) => {
  const { todo_li } = setDefaults(options, DEFAULTS_TODO_LIST);

  return getRenderElement(todo_li);
};
