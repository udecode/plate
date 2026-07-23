import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const selection = tx.selection();

  if (!selection) return;

  const codeBlockType = editor.getType(KEYS.codeBlock);
  const codeLineType = editor.getType(KEYS.codeLine);

  const isActive = tx.nodes.some({
    at: selection,
    match: { type: codeBlockType },
  });

  unwrapCodeBlock(editor, tx);

  if (!isActive) {
    tx.nodes.set({
      type: codeLineType,
    });

    const codeBlock = {
      children: [],
      type: codeBlockType,
    };

    tx.nodes.wrap(codeBlock);
  }
};
