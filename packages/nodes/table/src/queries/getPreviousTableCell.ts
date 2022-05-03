import { TEditor, TNodeEntry } from '@udecode/plate-core';
import { Editor, Path } from 'slate';
import { getCellInPreviousTableRow } from './getCellInPreviousTableRow';

export function getPreviousTableCell(
  editor: TEditor,
  currentCell: TNodeEntry,
  currentPath: Path,
  currentRow: TNodeEntry
): TNodeEntry | undefined {
  try {
    return Editor.node(editor, Path.previous(currentPath));
  } catch (err) {
    const [, currentRowPath] = currentRow;
    return getCellInPreviousTableRow(editor, currentRowPath);
  }
}
