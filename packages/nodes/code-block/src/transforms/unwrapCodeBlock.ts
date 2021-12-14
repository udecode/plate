import { getPluginType, PlateEditor, unwrapNodes } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../constants';
import { getCodeLineType } from '../options';

export const unwrapCodeBlock = (editor: PlateEditor) => {
  unwrapNodes(editor, {
    match: { type: getCodeLineType(editor) },
  });
  unwrapNodes(editor, {
    match: { type: getPluginType(editor, ELEMENT_CODE_BLOCK) },
    split: true,
  });
};
