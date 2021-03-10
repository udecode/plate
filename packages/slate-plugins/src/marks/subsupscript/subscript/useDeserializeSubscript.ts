import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, useEditorOptions } from '@udecode/slate-plugins-core';
import { MARK_SUBSCRIPT } from '../defaults';

export const useDeserializeSubscript = (): DeserializeHtml => {
  const options = useEditorOptions(MARK_SUBSCRIPT);

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
