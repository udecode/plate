import {
  type PlateEditor,
  type TElement,
  getPluginType,
  setElements,
  someNode,
  withoutNormalizing,
  wrapNodes,
} from '@udecode/plate-common';

import { CodeBlockPlugin } from '../CodeBlockPlugin';
import { getCodeLineType } from '../options';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: PlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = editor.getType(CodeBlockPlugin);
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
