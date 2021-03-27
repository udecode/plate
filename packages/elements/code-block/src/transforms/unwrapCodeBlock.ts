import { unwrapNodes } from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '../defaults';

export const unwrapCodeBlock = (editor: SPEditor) => {
  unwrapNodes(editor, {
    match: { type: getSlatePluginType(editor, ELEMENT_CODE_LINE) },
  });
  unwrapNodes(editor, {
    match: { type: getSlatePluginType(editor, ELEMENT_CODE_BLOCK) },
    split: true,
  });
};
