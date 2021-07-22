import { getLeafDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { MARK_KBD } from './defaults';

export const getKbdDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, MARK_KBD);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [
        { nodeNames: ['KBD'] },
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
