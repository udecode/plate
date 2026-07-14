import {
  type Editor,
  type NodeEntry,
  type Path,
  PathApi,
} from '@platejs/plite';

import { getCellInPreviousTableRow } from './getCellInPreviousTableRow';

export const getPreviousTableCell = (
  editor: Editor,
  _currentCell: NodeEntry,
  currentPath: Path,
  currentRow: NodeEntry
): NodeEntry | undefined => {
  if (currentPath.at(-1) === 0) {
    const [, currentRowPath] = currentRow;

    return getCellInPreviousTableRow(editor, currentRowPath);
  }

  const prevPath = PathApi.previous(currentPath);

  const cell = editor.read.nodes.get(prevPath);

  if (cell) return cell;
};
