import {
  getNodeEntry,
  TEditor,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';
import { Path } from 'slate';
import { getCellInNextTableRow } from './getCellInNextTableRow';

export const getNextTableCell = <V extends Value>(
  editor: TEditor<V>,
  currentCell: TNodeEntry,
  currentPath: Path,
  currentRow: TNodeEntry
): TNodeEntry | undefined => {
  try {
    return getNodeEntry(editor, Path.next(currentPath));
  } catch (err) {
    const [, currentRowPath] = currentRow;
    return getCellInNextTableRow(editor, currentRowPath);
  }
};
