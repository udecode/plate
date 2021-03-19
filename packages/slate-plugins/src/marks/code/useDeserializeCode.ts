import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { MARK_CODE } from './defaults';

export const useDeserializeCode = (): Deserialize => (editor: Editor) => {
  const options = getPluginOptions(editor, MARK_CODE);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [
        { nodeNames: ['CODE'] },
        {
          style: {
            wordWrap: 'break-word',
          },
        },
      ],
      ...options.deserialize,
    }),
  };
};
