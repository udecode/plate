import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { MARK_CODE } from './defaults';

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
