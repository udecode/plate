import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getItalicDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    leaf: getLeafDeserializer({
      type,
      rules: [
        { nodeNames: ['EM', 'I'] },
        {
          style: {
            fontStyle: 'italic',
          },
        },
      ],
    }),
  };
};
