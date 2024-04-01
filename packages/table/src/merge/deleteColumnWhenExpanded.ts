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

export const deleteColumnWhenExpanded = <V extends Value>(
  editor: PlateEditor<V>,
  tableEntry: TNodeEntry<TTableCellElement>
) => {
  const rowCount = tableEntry[0].children.length;

  const cells = getTableGridAbove(editor, {
    format: 'cell',
  }) as TNodeEntry<TTableCellElement>[];

  let lastCellRowIndex = -1;
  let acrossRow = 0;

  const pathRefs: PathRef[] = [];

  cells.forEach(([cell, cellPath], index) => {
    const currentCellRowIndex = getCellRowIndexByPath(cellPath);

    // not on the same line
    if (currentCellRowIndex !== lastCellRowIndex) {
      acrossRow += cell.rowSpan ?? 1;
    }

    pathRefs.push(createPathRef(editor, cellPath));
    lastCellRowIndex = currentCellRowIndex;
  });

  if (rowCount === acrossRow) {
    pathRefs.forEach((pathRef) => {
      removeNodes(editor, { at: pathRef.unref()! });
    });
  }
};
