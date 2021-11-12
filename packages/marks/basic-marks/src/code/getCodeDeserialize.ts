import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getCodeDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    leaf: getLeafDeserializer({
      type,
      rules: [
        { nodeNames: ['CODE'] },
        {
          style: {
            wordWrap: 'break-word',
          },
        },
      ],
    }),
  };
};
