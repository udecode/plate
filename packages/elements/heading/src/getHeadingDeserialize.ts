import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getHeadingDeserialize = (key: string): Deserialize => (
  editor,
  { type }
) => {
  return {
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: key.toUpperCase() }],
    }),
  };
};
