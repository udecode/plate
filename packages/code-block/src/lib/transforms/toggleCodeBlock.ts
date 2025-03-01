import type { SlateEditor, TElement } from '@udecode/plate';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = editor.getType(BaseCodeBlockPlugin);

  const isActive = editor.api.some({
    match: { type: codeBlockType },
  });

  editor.tf.withoutNormalizing(() => {
    unwrapCodeBlock(editor);

    if (!isActive) {
      const text = editor.api.string();

      const codeBlock = {
        children: [{ text }],
        type: codeBlockType,
      };

      // Delete the current selection content
      editor.tf.delete();

      // Insert the code block
      editor.tf.insertNodes<TElement>(codeBlock);
    }
  });
};
