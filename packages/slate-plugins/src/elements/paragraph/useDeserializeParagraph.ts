import { getElementDeserializer } from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorPluginOptions,
} from '@udecode/slate-plugins-core';
import { ELEMENT_PARAGRAPH } from './defaults';

export const useDeserializeParagraph = (): DeserializeHtml => {
  const options = useEditorPluginOptions(ELEMENT_PARAGRAPH);

  return {
    element: getElementDeserializer({
      type: options.type,
      rules: [{ nodeNames: 'P' }],
      ...options.deserialize,
    }),
  };
};
