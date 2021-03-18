import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { MARK_STRIKETHROUGH } from './defaults';

export const useDeserializeStrikethrough = (): DeserializeHtml => (
  editor: Editor
) => {
  const options = getPluginOptions(editor, MARK_STRIKETHROUGH);

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
