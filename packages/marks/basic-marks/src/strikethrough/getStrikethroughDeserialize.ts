import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { MARK_STRIKETHROUGH } from './defaults';

export const getStrikethroughDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    leaf: getLeafDeserializer({
      type,
      rules: [
        { nodeNames: ['S', 'DEL', 'STRIKE'] },
        {
          style: {
            textDecoration: 'line-through',
          },
        },
      ],
    }),
  };
};
