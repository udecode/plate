import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

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
