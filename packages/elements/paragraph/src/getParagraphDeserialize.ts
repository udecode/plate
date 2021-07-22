import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { ELEMENT_PARAGRAPH } from './defaults';

export const getParagraphDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, ELEMENT_PARAGRAPH);

  return {
    element: getElementDeserializer({
      type: options.type,
      rules: [{ nodeNames: 'P' }],
      ...options.deserialize,
    }),
  };
};
