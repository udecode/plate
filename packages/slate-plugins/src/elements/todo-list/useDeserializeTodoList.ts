import {
  getNodeDeserializer,
  getSlateClass,
} from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorPluginOptions,
} from '@udecode/slate-plugins-core';
import { CLASS_TODO_LIST_CHECKED } from './constants';
import { ELEMENT_TODO_LI } from './defaults';

export const useDeserializeTodoList = (): DeserializeHtml => {
  const options = useEditorPluginOptions(ELEMENT_TODO_LI);

  return {
    element: getNodeDeserializer({
      type: options.type,
      node: (el) => ({
        type: options.type,
        checked: el.classList.contains(CLASS_TODO_LIST_CHECKED),
      }),
      rules: [{ className: getSlateClass(options.type) }],
    }),
  };
};
