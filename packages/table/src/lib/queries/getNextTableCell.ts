import {
  type Editor,
  type NodeEntry,
  type Path,
  PathApi,
} from '@platejs/plite';

import { getCellInNextTableRow } from './getCellInNextTableRow';

export const getNextTableCell = (
  editor: Editor,
  _currentCell: NodeEntry,
  currentPath: Path,
  currentRow: NodeEntry
): NodeEntry | undefined => {
  const cell = editor.read.nodes.get(PathApi.next(currentPath));

  if (cell) return cell;

  const [, currentRowPath] = currentRow;

  return getCellInNextTableRow(editor, currentRowPath);
};
