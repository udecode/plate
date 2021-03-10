import {
  getElementDeserializer,
  getSlateClass,
} from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorMultiOptions,
} from '@udecode/slate-plugins-core';
import { KEYS_CODE_BLOCK } from './defaults';

// FIXME Handle code_line

export const useDeserializeCodeBlock = (): DeserializeHtml => {
  const { code_block, code_line } = useEditorMultiOptions(KEYS_CODE_BLOCK);

  return {
    element: [
      ...getElementDeserializer({
        type: code_block.type,
        rules: [
          { nodeNames: 'PRE' },
          { className: getSlateClass(code_block.type) },
        ],
        ...code_block.deserialize,
      }),
      ...getElementDeserializer({
        type: code_line.type,
        rules: [{ className: getSlateClass(code_line.type) }],
        ...code_line.deserialize,
      }),
    ],
  };
};
