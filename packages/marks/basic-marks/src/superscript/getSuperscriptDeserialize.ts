import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { MARK_SUPERSCRIPT } from './defaults';

export const getSuperscriptDeserialize = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, MARK_SUPERSCRIPT);

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
