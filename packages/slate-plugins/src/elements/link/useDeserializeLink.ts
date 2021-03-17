import { getNodeDeserializer } from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorPluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_LINK } from './defaults';

export const useDeserializeLink = (): DeserializeHtml => {
  const options = useEditorPluginOptions(ELEMENT_LINK);

  return {
    element: getNodeDeserializer({
      type: options.type,
      node: (el) => ({
        type: options.type,
        url: el.getAttribute('href'),
      }),
      rules: [{ nodeNames: 'A' }],
      ...options.deserialize,
    }),
  };
};
