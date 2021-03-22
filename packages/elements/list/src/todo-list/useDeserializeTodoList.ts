import {
  getNodeDeserializer,
  getSlateClass,
} from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { CLASS_TODO_LIST_CHECKED } from './constants';
import { ELEMENT_TODO_LI } from './defaults';

export const useDeserializeTodoList = (): Deserialize => (editor: Editor) => {
  const options = getPluginOptions(editor, ELEMENT_TODO_LI);

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
