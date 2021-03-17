import { getNodeDeserializer } from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorPluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_IMAGE } from './defaults';

export const useDeserializeImage = (): DeserializeHtml => {
  const options = useEditorPluginOptions(ELEMENT_IMAGE);

  return {
    element: getNodeDeserializer({
      type: options.type,
      node: (el) => ({
        type: options.type,
        url: el.getAttribute('src'),
      }),
      rules: [{ nodeNames: 'IMG' }],
      ...options.deserialize,
    }),
  };
};
