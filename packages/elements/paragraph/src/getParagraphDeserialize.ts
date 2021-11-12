import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

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
