import { getElementDeserializer } from '@udecode/plate-common';
import {
  Deserialize,
  getPlatePluginOptions,
  getSlateClass,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './defaults';

export const getCodeBlockDeserialize = (): Deserialize => (editor) => {
  const code_block = getPlatePluginOptions(editor, ELEMENT_CODE_BLOCK);
  const code_line = getPlatePluginOptions(editor, ELEMENT_CODE_LINE);

  return {
    isDisabled: (deserializerId) =>
      !code_block.derserializers.includes(deserializerId),
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
