import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { ELEMENT_BLOCKQUOTE } from './defaults';

export const getBlockquoteDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, ELEMENT_BLOCKQUOTE);

  return {
    element: getElementDeserializer({
      type: options.type,
      rules: [{ nodeNames: 'BLOCKQUOTE' }],
      ...options.deserialize,
    }),
  };
};
