import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Insert a code line starting with indentation. */
export const insertCodeLine = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  indentDepth = 0
) => {
  if (editor.read.selection()) {
    const indent = ' '.repeat(indentDepth);

    tx.nodes.insert({
      children: [{ text: indent }],
      type: editor.getType(KEYS.codeLine),
    });
  }
};
