import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { Deserialize, getPluginOptions } from '@udecode/slate-plugins-core';
import { MARK_UNDERLINE } from './defaults';

export const useDeserializeUnderline = (): Deserialize => (editor) => {
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
