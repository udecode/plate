import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { MARK_KBD } from './defaults';

export const useDeserializeKbd = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, MARK_KBD);

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
