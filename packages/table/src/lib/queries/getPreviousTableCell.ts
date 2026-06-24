import type { NodeEntry, Path } from '@platejs/plite';
import { PathApi } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { getCellInPreviousTableRow } from './getCellInPreviousTableRow';

export const getPreviousTableCell = (
  editor: BasePlateEditor,
  _currentCell: NodeEntry,
  currentPath: Path,
  currentRow: NodeEntry
): NodeEntry | undefined => {
  if (!PathApi.hasPrevious(currentPath)) {
    const [, currentRowPath] = currentRow;

    return getCellInPreviousTableRow(editor, currentRowPath);
  }

  const prevPath = PathApi.previous(currentPath);
  const cell = editor.api.node(prevPath);

  if (cell) return cell;
};
