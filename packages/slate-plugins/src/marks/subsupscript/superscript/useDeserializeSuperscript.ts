import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { MARK_SUPERSCRIPT } from '../defaults';

export const useDeserializeSuperscript = (): Deserialize => (
  editor: Editor
) => {
  const options = getPluginOptions(editor, MARK_SUPERSCRIPT);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [
        { nodeNames: ['SUP'] },
        {
          style: {
            verticalAlign: 'super',
          },
        },
      ],
      ...options.deserialize,
    }),
  };
};
