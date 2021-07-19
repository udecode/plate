import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { MARK_UNDERLINE } from './defaults';

export const getUnderlineDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, MARK_UNDERLINE);

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
