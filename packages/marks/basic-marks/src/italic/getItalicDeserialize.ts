import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { MARK_ITALIC } from './defaults';

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
