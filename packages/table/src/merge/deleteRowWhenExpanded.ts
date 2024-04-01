import {
  createPathRef,
  PlateEditor,
  removeNodes,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';
import { PathRef } from 'slate';

import { getTableGridAbove } from '../queries';
import { TTableCellElement } from '../types';
import { getTableMergedColumnCount } from './getTableMergedColumnCount';

export const deleteRowWhenExpanded = <V extends Value>(
  editor: PlateEditor<V>,
  [table, tablePath]: TNodeEntry<TTableCellElement>
) => {
  const columnCount = getTableMergedColumnCount(table);

  const cells = getTableGridAbove(editor, {
    format: 'cell',
  }) as TNodeEntry<TTableCellElement>[];

  const firsRowIndex = cells[0][1].at(-2) ?? null;

  if (firsRowIndex === null) return;

  let acrossColumn = 0;
  let lastRowIndex = -1;
  let rowSpanCarry = 0;
  let acrossRow = 0;

  cells.forEach(([cell, cellPath], index) => {
    if (cellPath.at(-2) === firsRowIndex) {
      acrossColumn += cell.colSpan ?? 1;
    }

    const currentRowIndex = cellPath.at(-2)!;

    if (lastRowIndex !== currentRowIndex) {
      if (rowSpanCarry !== 0) {
        rowSpanCarry--;
        return;
      }

      const { rowSpan } = cell;

      rowSpanCarry = rowSpan && rowSpan > 1 ? rowSpan - 1 : 0;
      acrossRow += rowSpan ?? 1;
    }

    lastRowIndex = currentRowIndex;
  });

  if (acrossColumn === columnCount) {
    const pathRefs: PathRef[] = [];
    for (let i = firsRowIndex; i < firsRowIndex + acrossRow; i++) {
      const removedPath = tablePath.concat(i);
      pathRefs.push(createPathRef(editor, removedPath));
    }

    pathRefs.forEach((item) => {
      removeNodes(editor, { at: item.unref()! });
    });
  }
};
