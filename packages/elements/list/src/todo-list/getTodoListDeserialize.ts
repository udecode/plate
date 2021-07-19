import { getNodeDeserializer } from '@udecode/plate-common';
import {
  Deserialize,
  getPlatePluginOptions,
  getSlateClass,
} from '@udecode/plate-core';
import { CLASS_TODO_LIST_CHECKED } from './constants';
import { ELEMENT_TODO_LI } from './defaults';

export const getTodoListDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, ELEMENT_TODO_LI);

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
