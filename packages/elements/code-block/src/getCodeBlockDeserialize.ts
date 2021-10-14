import { findNode, getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getSlateClass } from '@udecode/plate-core';
import { getCodeBlockPluginOptions, getCodeLinePluginOptions } from './options';

export const getCodeBlockDeserialize = (): Deserialize => (editor) => {
  const code_block = getCodeBlockPluginOptions(editor);
  const code_line = getCodeLinePluginOptions(editor);

  return {
    isDisabled: (deserializerId) => {
      const isSelectionInCodeLine =
        findNode(editor, { match: { type: code_line.type } }) !== undefined;

      return (
        isSelectionInCodeLine &&
        !code_block.deserializers?.includes(deserializerId)
      );
    },
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
