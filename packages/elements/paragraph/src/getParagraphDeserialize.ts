import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { ELEMENT_PARAGRAPH } from './defaults';

export const getParagraphDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: 'P' }],
    }),
  };
};
