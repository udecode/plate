import type { SlateEditor } from '@udecode/plate';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';

/** Is the selection at the start of a code block */
export const isSelectionAtCodeBlockStart = (editor: SlateEditor) => {
  const { selection } = editor;

  if (!selection || editor.api.isExpanded()) return false;

  // Find the code block containing the selection
  const [codeBlock] = editor.api.nodes({
    at: selection,
    match: { type: editor.getType(BaseCodeBlockPlugin) },
  });

  if (!codeBlock) return false;

  const [, path] = codeBlock;
  return editor.api.isStart(selection.anchor, path);
};
