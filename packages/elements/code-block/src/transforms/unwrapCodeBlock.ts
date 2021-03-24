import { unwrapNodes } from '@udecode/slate-plugins-common';
import { getPluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '../defaults';

export const unwrapCodeBlock = (editor: SPEditor) => {
  unwrapNodes(editor, {
    match: { type: getPluginType(editor, ELEMENT_CODE_LINE) },
  });
  unwrapNodes(editor, {
    match: { type: getPluginType(editor, ELEMENT_CODE_BLOCK) },
    split: true,
  });
};
