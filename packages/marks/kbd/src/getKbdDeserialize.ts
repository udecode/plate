import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin } from '@udecode/plate-core';
import { MARK_KBD } from './defaults';

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
