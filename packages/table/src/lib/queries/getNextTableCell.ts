import {
  type Editor,
  type NodeEntry,
  type Path,
  PathApi,
} from '@udecode/plate-common';

import { getCellInNextTableRow } from './getCellInNextTableRow';

export const getNextTableCell = (
  editor: Editor,
  currentCell: NodeEntry,
  currentPath: Path,
  currentRow: NodeEntry
): NodeEntry | undefined => {
  const cell = editor.api.node(PathApi.next(currentPath));

  if (cell) return cell;

  const [, currentRowPath] = currentRow;

  return getCellInNextTableRow(editor, currentRowPath);
};
