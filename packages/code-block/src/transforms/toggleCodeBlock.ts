import {
  getPluginType,
  PlateEditor,
  setElements,
  someNode,
  TElement,
  Value,
  withoutNormalizing,
  wrapNodes,
} from '@udecode/plate-common';
import { ELEMENT_CODE_BLOCK } from '../constants';
import { getCodeLineType } from '../options/index';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = <V extends Value>(editor: PlateEditor<V>) => {
  if (!editor.selection) return;

  const codeBlockType = getPluginType(editor, ELEMENT_CODE_BLOCK);
  const codeLineType = getCodeLineType(editor);

  const isActive = someNode(editor, {
    match: { type: codeBlockType },
  });

  withoutNormalizing(editor, () => {
    unwrapCodeBlock(editor);

    if (!isActive) {
      setElements(editor, {
        type: codeLineType,
      });

      const codeBlock = {
        type: codeBlockType,
        children: [],
      };

      wrapNodes<TElement>(editor, codeBlock);
    }
  });
};
