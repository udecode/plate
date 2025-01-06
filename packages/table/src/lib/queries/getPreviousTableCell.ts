import {
  type Editor,
  type NodeEntry,
  type Path,
  getPreviousPath,
} from '@udecode/plate';

import { getCellInPreviousTableRow } from './getCellInPreviousTableRow';

export const getPreviousTableCell = (
  editor: Editor,
  currentCell: NodeEntry,
  currentPath: Path,
  currentRow: NodeEntry
): NodeEntry | undefined => {
  const prevPath = getPreviousPath(currentPath);

  if (!prevPath) {
    const [, currentRowPath] = currentRow;

    return getCellInPreviousTableRow(editor, currentRowPath);
  }

  const cell = editor.api.node(prevPath);

  if (cell) return cell;
};
