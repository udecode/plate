import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getHighlightDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    leaf: getLeafDeserializer({
      type,
      rules: [{ nodeNames: ['MARK'] }],
    }),
  };
};
