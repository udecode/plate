import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getHeadingDeserialize = (): Deserialize => (
  editor,
  { key, type }
) => {
  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: key.toUpperCase() }],
    }),
  };
};
