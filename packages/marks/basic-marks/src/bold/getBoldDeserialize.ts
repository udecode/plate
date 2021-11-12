import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getBoldDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    leaf: getLeafDeserializer({
      type,
      rules: [
        { nodeNames: ['STRONG'] },
        {
          style: {
            fontWeight: ['600', '700', 'bold'],
          },
        },
      ],
    }),
  };
};
