import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { MARK_ITALIC } from './defaults';

export const getItalicDeserialize = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, MARK_ITALIC);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [
        { nodeNames: ['EM', 'I'] },
        {
          style: {
            fontStyle: 'italic',
          },
        },
      ],
      ...options.deserialize,
    }),
  };
};
