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

export const getCodeBlockDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    isDisabled: isDisabled(editor),
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: 'PRE' }, { className: getSlateClass(type!) }],
    }),
  };
};

export const getCodeLineDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    isDisabled: isDisabled(editor),
    element: getElementDeserializer({
      type,
      rules: [{ className: getSlateClass(type!) }],
    }),
  };
};
