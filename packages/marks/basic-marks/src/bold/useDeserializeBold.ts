import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { MARK_BOLD } from './defaults';

export const useDeserializeBold = (): Deserialize => (editor: Editor) => {
  const options = getPluginOptions(editor, MARK_BOLD);

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
