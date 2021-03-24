import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { ELEMENT_PARAGRAPH } from './defaults';

export const useDeserializeParagraph = (): Deserialize => (editor) => {
  const options = getPluginOptions(editor, ELEMENT_PARAGRAPH);

  return {
    element: getElementDeserializer({
      type: options.type,
      rules: [{ nodeNames: 'P' }],
      ...options.deserialize,
    }),
  };
};
