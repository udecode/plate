import {
  TEditor,
  TNodeEntry,
  Value,
  getNodeEntry,
  getPreviousPath,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { getCellInPreviousTableRow } from './getCellInPreviousTableRow';

export const getPreviousTableCell = <V extends Value>(
  editor: TEditor<V>,
  currentCell: TNodeEntry,
  currentPath: Path,
  currentRow: TNodeEntry
): TNodeEntry | undefined => {
  const prevPath = getPreviousPath(currentPath);
  if (!prevPath) {
    const [, currentRowPath] = currentRow;
    return getCellInPreviousTableRow(editor, currentRowPath);
  }

  const cell = getNodeEntry(editor, prevPath);
  if (cell) return cell;
};
