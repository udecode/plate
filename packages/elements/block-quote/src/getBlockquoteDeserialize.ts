import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { ELEMENT_BLOCKQUOTE } from './defaults';

export const getBlockquoteDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: 'BLOCKQUOTE' }],
    }),
  };
};
