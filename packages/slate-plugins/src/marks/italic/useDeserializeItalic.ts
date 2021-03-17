import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorPluginOptions,
} from '@udecode/slate-plugins-core';
import { MARK_ITALIC } from './defaults';

export const useDeserializeItalic = (): DeserializeHtml => {
  const options = useEditorPluginOptions(MARK_ITALIC);

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
