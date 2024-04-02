import {
  createPathRef,
  PlateEditor,
  removeNodes,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';
import { PathRef } from 'slate';

import { getRowSpan, getTableGridAbove } from '../queries';
import { TTableCellElement } from '../types';
import { getCellRowIndexByPath } from '../utils/getCellRowIndexByPath';
import { getSelectionWidth } from './getSelectionWidth';

export const deleteColumnWhenExpanded = <V extends Value>(
  editor: PlateEditor<V>,
  tableEntry: TNodeEntry<TTableCellElement>
) => {
  const rowCount = tableEntry[0].children.length;

  const cells = getTableGridAbove(editor, {
    format: 'cell',
  }) as TNodeEntry<TTableCellElement>[];

  const selectionWidth = getSelectionWidth(cells);

  let lastRowIndexWorker = 0;
  let lastRowCells: TNodeEntry<TTableCellElement>[] = [];
  const rowCarries: number[] = [];

  let isLastRow = false;
  for (let i = 0; i < cells.length + 1; i++) {
    if (!cells[i]) {
      isLastRow = true;
    }

    const item = isLastRow ? null : cells[i];

    const currentCellRowIndex = isLastRow
      ? -2
      : getCellRowIndexByPath(item![1]);

    if (currentCellRowIndex === lastRowIndexWorker && !isLastRow) {
      lastRowCells.push(item!);
    } else {
      const lastRowCarry = getLastCellCarry(lastRowCells);
      rowCarries.push(lastRowCarry);

      if (!isLastRow) {
        lastRowCells = [item!];
      }
    }

    lastRowIndexWorker = currentCellRowIndex;
  }

  let lastCellRowIndex = -1;
  let acrossRow = 0;
  let rowSpanCarry = 0;
  const pathRefs: PathRef[] = [];

  cells.forEach(([cell, cellPath], index) => {
    const currentCellRowIndex = getCellRowIndexByPath(cellPath);

    if (currentCellRowIndex !== lastCellRowIndex) {
      if (rowSpanCarry !== 0) {
        rowSpanCarry--;
        return;
      }
      const rowSpan = getRowSpan(cell);

      acrossRow += rowSpan ?? 1;

      rowSpanCarry = rowSpan && rowSpan > 1 ? rowSpan - 1 : 0;
      rowSpanCarry = rowSpanCarry - rowCarries[currentCellRowIndex];
    }

    pathRefs.push(createPathRef(editor, cellPath));
    lastCellRowIndex = currentCellRowIndex;
  });

  // 该变量在特定情况下会有问题，结合selectionWidth进行处理
  if (rowCount === acrossRow) {
    pathRefs.forEach((pathRef) => {
      removeNodes(editor, { at: pathRef.unref()! });
    });
  }
};

// 该函数需要补充完整
function getLastCellCarry(
  lastRowCells: TNodeEntry<TTableCellElement>[]
): number {
  console.log(lastRowCells, 'last');
  if (lastRowCells.length === 1) {
    const cell = lastRowCells[0][0];
    const rowSpan = getRowSpan(cell);

    const res = rowSpan ?? 1;
    return res - 1;
  }

  const isFlat = isFlatRow(lastRowCells);
  console.log('🚀 ~ isFlat:', isFlat);

  if (isFlat) {
    return getRowSpan(lastRowCells[0][0]) - 1;
  }
  return 0;
}

function isFlatRow(row: TNodeEntry<TTableCellElement>[]) {
  try {
    row
      .map((item) => item[0])
      .reduce((prev, cur) => {
        if (getRowSpan(prev) === getRowSpan(cur)) return cur;
        throw 'not flat';
      });
    return true;
  } catch (error) {
    return false;
  }
}
