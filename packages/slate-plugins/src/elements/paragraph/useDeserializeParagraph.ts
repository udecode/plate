import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, useEditorOptions } from '@udecode/slate-plugins-core';
import { ELEMENT_PARAGRAPH } from './defaults';

export const useDeserializeParagraph = (): DeserializeHtml => {
  const options = useEditorOptions(ELEMENT_PARAGRAPH);

  return {
    element: getElementDeserializer({
      type: options.type,
      rules: [{ nodeNames: 'P' }],
      ...options.deserialize,
    }),
  };
};
