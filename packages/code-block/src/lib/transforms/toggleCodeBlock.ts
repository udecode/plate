import {
  type SlateEditor,
  type TElement,
  setElements,
  someNode,
  withoutNormalizing,
  wrapNodes,
} from '@udecode/plate-common';

import { CodeBlockPlugin, CodeLinePlugin } from '../CodeBlockPlugin';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = editor.getType(CodeBlockPlugin);
  const codeLineType = editor.getType(CodeLinePlugin);

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
