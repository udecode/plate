import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { MARK_SUBSCRIPT } from '../defaults';

export const useDeserializeSubscript = (): DeserializeHtml => (
  editor: Editor
) => {
  const options = getPluginOptions(editor, MARK_SUBSCRIPT);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [
        { nodeNames: ['SUB'] },
        {
          style: {
            verticalAlign: 'sub',
          },
        },
      ],
      ...options.deserialize,
    }),
  };
};
