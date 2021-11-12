import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin, getSlateClass } from '@udecode/plate-core';
import { CLASS_TODO_LIST_CHECKED } from './constants';
import { ELEMENT_TODO_LI } from './defaults';

export const getTodoListDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getNodeDeserializer({
      type,
      getNode: (el) => ({
        type,
        checked: el.classList.contains(CLASS_TODO_LIST_CHECKED),
      }),
      rules: [{ className: getSlateClass(type) }],
    }),
  };
};
