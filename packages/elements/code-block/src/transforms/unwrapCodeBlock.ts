import { unwrapNodes } from '@udecode/plate-common';
import { PlateEditor } from '@udecode/plate-core';
import { getCodeBlockType, getCodeLineType } from '../options';

export const unwrapCodeBlock = (editor: PlateEditor) => {
  unwrapNodes(editor, {
    match: { type: getCodeLineType(editor) },
  });
  unwrapNodes(editor, {
    match: { type: getCodeBlockType(editor) },
    split: true,
  });
};
