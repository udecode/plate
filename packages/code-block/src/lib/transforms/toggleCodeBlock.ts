import type { SlateEditor, TElement } from 'platejs';

import { KEYS } from 'platejs';

import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = editor.getType(KEYS.codeBlock);
  const codeLineType = editor.getType(KEYS.codeLine);

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
