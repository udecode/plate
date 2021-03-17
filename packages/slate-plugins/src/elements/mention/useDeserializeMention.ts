import {
  getNodeDeserializer,
  getSlateClass,
} from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorPluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_MENTION } from './defaults';

export const useDeserializeMention = (): DeserializeHtml => {
  const options = useEditorPluginOptions(ELEMENT_MENTION);

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
