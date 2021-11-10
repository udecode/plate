import { findNode, getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getSlateClass, PlateEditor } from '@udecode/plate-core';
import { getCodeBlockPluginOptions, getCodeLinePluginOptions } from './options';

const isDisabled = (
  editor: PlateEditor
): ReturnType<Deserialize>['isDisabled'] => (deserializerId) => {
  const code_block = getCodeBlockPluginOptions(editor);
  const code_line = getCodeLinePluginOptions(editor);

  const isSelectionInCodeLine =
    findNode(editor, { match: { type: code_line.type } }) !== undefined;

  return (
    isSelectionInCodeLine && !code_block.deserializers?.includes(deserializerId)
  );
};

export const getCodeBlockDeserialize = (): Deserialize => (editor) => {
  const code_block = getCodeBlockPluginOptions(editor);
  const code_line = getCodeLinePluginOptions(editor);

  return {
    isDisabled: isDisabled(editor),
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

export const getCodeLineDeserialize = (): Deserialize => (editor) => {
  const code_line = getCodeLinePluginOptions(editor);

  return {
    isDisabled: isDisabled(editor),
    element: [
      ...getElementDeserializer({
        type: code_line.type,
        rules: [{ className: getSlateClass(code_line.type) }],
        ...code_line.deserialize,
      }),
    ],
  };
};
