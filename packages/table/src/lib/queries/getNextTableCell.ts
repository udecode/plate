import { type NodeEntry, type Path, PathApi } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

import { getCellInNextTableRow } from './getCellInNextTableRow';

export const getNextTableCell = (
  editor: SlateEditor,
  _currentCell: NodeEntry,
  currentPath: Path,
  currentRow: NodeEntry
): NodeEntry | undefined => {
  const cell = editor.api.node(PathApi.next(currentPath));

  if (cell) return cell;

  const [, currentRowPath] = currentRow;

  return getCellInNextTableRow(editor, currentRowPath);
};
