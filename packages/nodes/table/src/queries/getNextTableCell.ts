import { TEditor, TNodeEntry } from '@udecode/plate-core';
import { Editor, Path } from 'slate';
import { getCellInNextTableRow } from './getCellInNextTableRow';

export function getNextTableCell(
  editor: TEditor,
  currentCell: TNodeEntry,
  currentPath: Path,
  currentRow: TNodeEntry
): TNodeEntry | undefined {
  try {
    return Editor.node(editor, Path.next(currentPath));
  } catch (err) {
    const [, currentRowPath] = currentRow;
    return getCellInNextTableRow(editor, currentRowPath);
  }
}
