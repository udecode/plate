import {
  type TEditor,
  type TNodeEntry,
  type Value,
  getNodeEntry,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import { getCellInNextTableRow } from './getCellInNextTableRow';

export const getNextTableCell = <V extends Value>(
  editor: TEditor<V>,
  currentCell: TNodeEntry,
  currentPath: Path,
  currentRow: TNodeEntry
): TNodeEntry | undefined => {
  const cell = getNodeEntry(editor, Path.next(currentPath));

  if (cell) return cell;

  const [, currentRowPath] = currentRow;

  return getCellInNextTableRow(editor, currentRowPath);
};
