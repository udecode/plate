import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { MARK_SUPERSCRIPT } from './defaults';

export const getSuperscriptDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, MARK_SUPERSCRIPT);

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
