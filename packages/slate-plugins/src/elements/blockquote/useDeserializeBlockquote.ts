import { getElementDeserializer } from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorPluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_BLOCKQUOTE } from './defaults';

export const useDeserializeBlockquote = (): DeserializeHtml => {
  const options = useEditorPluginOptions(ELEMENT_BLOCKQUOTE);

  return {
    element: getElementDeserializer({
      type: options.type,
      rules: [{ nodeNames: 'BLOCKQUOTE' }],
      ...options.deserialize,
    }),
  };
};
