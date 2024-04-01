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

  let lastCellRowIndex = -1;
  let acrossRow = 0;
  let rowSpanCarry = 0;

  const pathRefs: PathRef[] = [];

  cells.forEach(([cell, cellPath], index) => {
    const currentCellRowIndex = getCellRowIndexByPath(cellPath);

    // not on the same line
    if (currentCellRowIndex !== lastCellRowIndex) {
      if (rowSpanCarry !== 0) {
        rowSpanCarry--;
        return;
      }
      const { rowSpan } = cell;

      acrossRow += rowSpan ?? 1;

      rowSpanCarry = rowSpan && rowSpan > 1 ? rowSpan - 1 : 0;
    }

    pathRefs.push(createPathRef(editor, cellPath));
    lastCellRowIndex = currentCellRowIndex;
  });

  // 该变量在特定情况下会有问题，结合selectionWidth进行处理
  console.log(acrossRow);
  if (rowCount === acrossRow) {
    pathRefs.forEach((pathRef) => {
      removeNodes(editor, { at: pathRef.unref()! });
    });
  }
};
