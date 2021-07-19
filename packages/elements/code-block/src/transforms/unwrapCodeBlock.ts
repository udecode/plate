import { unwrapNodes } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '../defaults';

export const unwrapCodeBlock = (editor: SPEditor) => {
  unwrapNodes(editor, {
    match: { type: getPlatePluginType(editor, ELEMENT_CODE_LINE) },
  });
  unwrapNodes(editor, {
    match: { type: getPlatePluginType(editor, ELEMENT_CODE_BLOCK) },
    split: true,
  });
};
