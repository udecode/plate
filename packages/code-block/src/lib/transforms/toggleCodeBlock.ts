import {
  type SlateEditor,
  type TElement,
  setElements,
  someNode,
  withoutNormalizing,
  wrapNodes,
} from '@udecode/plate-common';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
} from '../BaseCodeBlockPlugin';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = editor.getType(BaseCodeBlockPlugin);
  const codeLineType = editor.getType(BaseCodeLinePlugin);

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
