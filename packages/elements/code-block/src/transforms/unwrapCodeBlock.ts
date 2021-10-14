import { unwrapNodes } from '@udecode/plate-common';
import { SPEditor } from '@udecode/plate-core';
import { getCodeBlockType, getCodeLineType } from '../options';

export const unwrapCodeBlock = (editor: SPEditor) => {
  unwrapNodes(editor, {
    match: { type: getCodeLineType(editor) },
  });
  unwrapNodes(editor, {
    match: { type: getCodeBlockType(editor) },
    split: true,
  });
};
