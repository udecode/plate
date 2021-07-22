import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { MARK_SUBSCRIPT } from './defaults';

export const getSubscriptDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, MARK_SUBSCRIPT);

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
