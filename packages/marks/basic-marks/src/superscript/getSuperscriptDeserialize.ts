import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { MARK_SUPERSCRIPT } from './defaults';

export const getSuperscriptDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    leaf: getLeafDeserializer({
      type,
      rules: [
        { nodeNames: ['SUP'] },
        {
          style: {
            verticalAlign: 'super',
          },
        },
      ],
    }),
  };
};
