import { Editor, NodeEntry, Path } from 'slate';
import { getCellInPreviousTableRow } from './getCellInPreviousTableRow';

export function getPreviousTableCell(
  editor: Editor,
  currentCell: NodeEntry,
  currentPath: Path,
  currentRow: NodeEntry
): NodeEntry | undefined {
  try {
    return Editor.node(editor, Path.previous(currentPath));
  } catch (err) {
    const [, currentRowPath] = currentRow;
    return getCellInPreviousTableRow(editor, currentRowPath);
  }
}
