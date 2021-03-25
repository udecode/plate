import {
  getNodeDeserializer,
  getSlateClass,
} from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_MENTION } from './defaults';

export const useDeserializeMention = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, ELEMENT_MENTION);

  return {
    element: getNodeDeserializer({
      type: options.type,
      getNode: (el) => ({
        type: options.type,
        value: el.getAttribute('data-slate-value'),
      }),
      rules: [{ className: getSlateClass(options.type) }],
      ...options.deserialize,
    }),
  };
};
