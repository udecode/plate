import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, useEditorOptions } from '@udecode/slate-plugins-core';
import { MARK_BOLD } from './defaults';

export const useDeserializeBold = (): DeserializeHtml => {
  const options = useEditorOptions(MARK_BOLD);

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
