import {
  getNodeEntry,
  TEditor,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';
import { Path } from 'slate';
import { getCellInPreviousTableRow } from './getCellInPreviousTableRow';

export const getPreviousTableCell = <V extends Value>(
  editor: TEditor<V>,
  currentCell: TNodeEntry,
  currentPath: Path,
  currentRow: TNodeEntry
): TNodeEntry | undefined => {
  try {
    return getNodeEntry(editor, Path.previous(currentPath));
  } catch (err) {
    const [, currentRowPath] = currentRow;
    return getCellInPreviousTableRow(editor, currentRowPath);
  }
};
