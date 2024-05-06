import {
  type PlateEditor,
  type TElement,
  type Value,
  getPluginType,
  setElements,
  someNode,
  withoutNormalizing,
  wrapNodes,
} from '@udecode/plate-common/server';

import { ELEMENT_CODE_BLOCK } from '../constants';
import { getCodeLineType } from '../options';
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
        children: [],
        type: codeBlockType,
      };

      wrapNodes<TElement>(editor, codeBlock);
    }
  });
};
