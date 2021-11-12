import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { MARK_SUBSCRIPT } from './defaults';

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
