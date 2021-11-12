import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { MARK_UNDERLINE } from './defaults';

export const getUnderlineDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    leaf: getLeafDeserializer({
      type,
      rules: [
        { nodeNames: ['U'] },
        {
          style: {
            textDecoration: 'underline',
          },
        },
      ],
    }),
  };
};
