import type { PathRef } from 'slate';

import {
  type PlateEditor,
  type TNodeEntry,
  createPathRef,
  removeNodes,
} from '@udecode/plate-common/server';

import type { TTableCellElement } from '../types';

import { getRowSpan, getTableGridAbove } from '../queries';
import { getCellRowIndexByPath } from '../utils/getCellRowIndexByPath';
import { getTableMergedColumnCount } from './getTableMergedColumnCount';

export const deleteRowWhenExpanded = (
  editor: PlateEditor,
  [table, tablePath]: TNodeEntry<TTableCellElement>
) => {
  const columnCount = getTableMergedColumnCount(table);

  const cells = getTableGridAbove(editor, {
    format: 'cell',
  }) as TNodeEntry<TTableCellElement>[];

  const firsRowIndex = getCellRowIndexByPath(cells[0][1]);

  if (firsRowIndex === null) return;

  let acrossColumn = 0;
  let lastRowIndex = -1;
  let rowSpanCarry = 0;
  let acrossRow = 0;

  cells.forEach(([cell, cellPath]) => {
    if (cellPath.at(-2) === firsRowIndex) {
      acrossColumn += cell.colSpan ?? 1;
    }

    const currentRowIndex = getCellRowIndexByPath(cellPath);

    if (lastRowIndex !== currentRowIndex) {
      if (rowSpanCarry !== 0) {
        rowSpanCarry--;

        return;
      }

      const rowSpan = getRowSpan(cell);

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
