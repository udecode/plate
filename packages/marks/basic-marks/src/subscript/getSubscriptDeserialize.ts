import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getSubscriptDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    leaf: getLeafDeserializer({
      type,
      rules: [
        { nodeNames: ['SUB'] },
        {
          style: {
            verticalAlign: 'sub',
          },
        },
      ],
    }),
  };
};
