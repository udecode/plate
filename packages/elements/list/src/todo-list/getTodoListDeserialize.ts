import { getNodeDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlateClass,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { CLASS_TODO_LIST_CHECKED } from './constants';
import { ELEMENT_TODO_LI } from './defaults';

export const getTodoListDeserialize = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, ELEMENT_TODO_LI);

  return {
    element: getNodeDeserializer({
      type: options.type,
      getNode: (el) => ({
        type: options.type,
        checked: el.classList.contains(CLASS_TODO_LIST_CHECKED),
      }),
      rules: [{ className: getSlateClass(options.type) }],
    }),
  };
};
