import type { BaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Is the selection at the start of the first code line in a code block */
export const isSelectionAtCodeBlockStart = (editor: BaseEditor) => {
  if (editor.read.selection.isExpanded()) return false;

  return editor.read.selection.isAtBlockStart({
    match: { type: editor.getType(KEYS.codeBlock) },
  });
};
