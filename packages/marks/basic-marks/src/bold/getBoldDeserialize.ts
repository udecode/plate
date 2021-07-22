import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { MARK_BOLD } from './defaults';

export const getBoldDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, MARK_BOLD);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [
        { nodeNames: ['STRONG'] },
        {
          style: {
            fontWeight: ['600', '700', 'bold'],
          },
        },
      ],
      ...options.deserialize,
    }),
  };
};
