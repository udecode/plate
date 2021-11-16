import { findNode, getElementDeserializer } from '@udecode/plate-common';
import {
  Deserialize,
  getPlugin,
  getSlateClass,
  PlateEditor,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';
import { CodeBlockPlugin } from './types';

const isDisabled = (
  editor: PlateEditor
): ReturnType<Deserialize>['isDisabled'] => (deserializerId) => {
  const code_block = getPlugin<CodeBlockPlugin>(editor, ELEMENT_CODE_BLOCK);
  const code_line = getPlugin(editor, ELEMENT_CODE_LINE);

  const isSelectionInCodeLine =
    findNode(editor, { match: { type: code_line.type } }) !== undefined;

  return (
    isSelectionInCodeLine &&
    !code_block.options.deserializers?.includes(deserializerId)
  );
};

export const getCodeBlockDeserialize = (): Deserialize<{}, CodeBlockPlugin> => (
  editor,
  { type }
) => {
  return {
    isDisabled: isDisabled(editor),
    element: getElementDeserializer({
      type,
      rules: [{ nodeNames: 'PRE' }, { className: getSlateClass(type) }],
    }),
  };
};

export const getCodeLineDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    isDisabled: isDisabled(editor),
    element: getElementDeserializer({
      type,
      rules: [{ className: getSlateClass(type) }],
    }),
  };
};
