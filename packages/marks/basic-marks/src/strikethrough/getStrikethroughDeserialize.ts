import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { MARK_STRIKETHROUGH } from './defaults';

export const getStrikethroughDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, MARK_STRIKETHROUGH);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [
        { nodeNames: ['S', 'DEL', 'STRIKE'] },
        {
          style: {
            textDecoration: 'line-through',
          },
        },
      ],
      ...options.deserialize,
    }),
  };
};
