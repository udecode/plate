import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getSlateClass } from '@udecode/plate-core';

export const CLASS_TODO_LIST_CHECKED = 'slate-TodoListElement-rootChecked';

export const getTodoListDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    element: getNodeDeserializer({
      type,
      getNode: (el) => ({
        type,
        checked: el.classList.contains(CLASS_TODO_LIST_CHECKED),
      }),
      rules: [{ className: getSlateClass(type!) }],
    }),
  };
};
