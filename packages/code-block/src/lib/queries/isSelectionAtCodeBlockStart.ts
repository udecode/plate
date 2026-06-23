import type { BasePlateEditor } from 'platejs';

import { getCodeLineEntry } from './getCodeLineEntry';

/** Is the selection at the start of the first code line in a code block */
export const isSelectionAtCodeBlockStart = (editor: BasePlateEditor) => {
  const { selection } = editor;

  if (!selection || editor.api.isExpanded()) return false;

  const { codeBlock } = getCodeLineEntry(editor) ?? {};

  if (!codeBlock) return false;

  return editor.api.isStart(selection.anchor, codeBlock[1]);
};
