import {
  PlateEditor,
  removeNodes,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';

import { getTableGridAbove } from '../queries';
import { TTableCellElement } from '../types';

export const deleteRowWhenExpanded = <V extends Value>(
  editor: PlateEditor<V>,
  [table, tablePath]: TNodeEntry<TTableCellElement>
) => {
  const rowCount = table.children.length;

  const cells = getTableGridAbove(editor, {
    format: 'cell',
  }) as TNodeEntry<TTableCellElement>[];

  const firsRowIndex = cells[0][1].at(-2) ?? null;

  if (firsRowIndex === null) return;

  let acrossColumn = 0;

  cells.forEach(([cell, cellPath], index) => {
    if (cellPath.at(-2) === firsRowIndex) {
      acrossColumn += cell.colSpan ?? 1;
    }
  });

  if (acrossColumn === rowCount) {
    for (let i = firsRowIndex; i <= acrossColumn; i++) {
      const removedPath = tablePath.concat(i);
      removeNodes(editor, { at: removedPath });
    }
  }
};
