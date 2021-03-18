import {
  getNodeDeserializer,
  getSlateClass,
} from '@udecode/slate-plugins-common';
import { DeserializeHtml, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_MENTION } from './defaults';

export const useDeserializeMention = (): DeserializeHtml => (
  editor: Editor
) => {
  const options = getPluginOptions(editor, ELEMENT_MENTION);

  return {
    element: getNodeDeserializer({
      type: options.type,
      node: (el) => ({
        type: options.type,
        value: el.getAttribute('data-slate-value'),
      }),
      rules: [{ className: getSlateClass(options.type) }],
      ...options.deserialize,
    }),
  };
};
