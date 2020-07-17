import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getNodeDeserializer } from '../../common/utils/getNodeDeserializer';
import { setDefaults } from '../../common/utils/setDefaults';
import { CLASS_TODO_LIST_CHECKED } from './constants';
import { DEFAULTS_TODO_LIST } from './defaults';
import { TodoListDeserializeOptions } from './types';

export const deserializeTodoList = (
  options?: TodoListDeserializeOptions
): DeserializeHtml => {
  const { todo_li } = setDefaults(options, DEFAULTS_TODO_LIST);

  return {
    element: getNodeDeserializer({
      type: todo_li.type,
      node: (el) => ({
        type: todo_li.type,
        checked: el.classList.contains(CLASS_TODO_LIST_CHECKED),
      }),
      rules: [{ className: todo_li.rootProps.className }],
    }),
  };
};
