import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { MARK_UNDERLINE } from './defaults';

export const useDeserializeUnderline = (): DeserializeHtml => (
  editor: Editor
) => {
  const options = getPluginOptions(editor, MARK_UNDERLINE);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [
        { nodeNames: ['U'] },
        {
          style: {
            textDecoration: 'underline',
          },
        },
      ],
      ...options.deserialize,
    }),
  };
};
