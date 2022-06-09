import {
  getPluginType,
  PlateEditor,
  unwrapNodes,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../constants';
import { getCodeLineType } from '../options';

export const unwrapCodeBlock = <V extends Value>(editor: PlateEditor<V>) => {
  unwrapNodes(editor, {
    match: { type: getCodeLineType(editor) },
  });
  unwrapNodes(editor, {
    match: { type: getPluginType(editor, ELEMENT_CODE_BLOCK) },
    split: true,
  });
};
