import type { SlateEditor, TElement } from '@udecode/plate';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
} from '../BaseCodeBlockPlugin';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = editor.getType(BaseCodeBlockPlugin);
  const codeLineType = editor.getType(BaseCodeLinePlugin);

  const isActive = editor.api.some({
    match: { type: codeBlockType },
  });

  editor.tf.withoutNormalizing(() => {
    unwrapCodeBlock(editor);

    if (!isActive) {
      editor.tf.setNodes({
        type: codeLineType,
      });

      const codeBlock = {
        children: [],
        type: codeBlockType,
      };

      editor.tf.wrapNodes<TElement>(codeBlock);
    }
  });
};
