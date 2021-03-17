import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorPluginOptions,
} from '@udecode/slate-plugins-core';
import { MARK_SUPERSCRIPT } from '../defaults';

export const useDeserializeSuperscript = (): DeserializeHtml => {
  const options = useEditorPluginOptions(MARK_SUPERSCRIPT);

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
