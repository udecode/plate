import {
  isExpanded,
  isStartPoint,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { getCodeLineEntry } from './getCodeLineEntry';

/**
 * Is the selection at the start of the first code line in a code block
 */
export const isSelectionAtCodeBlockStart = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { selection } = editor;
  if (!selection || isExpanded(selection)) return false;

  const { codeBlock } = getCodeLineEntry(editor) ?? {};
  if (!codeBlock) return false;

  return isStartPoint(editor, selection.anchor, codeBlock[1]);
};
