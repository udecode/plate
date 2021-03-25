import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { MARK_STRIKETHROUGH } from './defaults';

export const useDeserializeStrikethrough = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, MARK_STRIKETHROUGH);

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
