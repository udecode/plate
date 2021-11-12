import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getKbdDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    leaf: getLeafDeserializer({
      type,
      rules: [
        { nodeNames: ['KBD'] },
        {
          style: {
            wordWrap: 'break-word',
          },
        },
      ],
    }),
  };
};
