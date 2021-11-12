import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { MARK_BOLD } from './defaults';

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
