import type {
  EditorUpdateTransaction,
  NodeEntry,
  PathRef,
} from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import type { TTableCellElement, TTableElement } from '@platejs/utils';

import { getEditorPlugin } from '@platejs/core';

import {
  BaseTablePlugin,
  getCellRowIndexByPath,
  getTableMergedColumnCount,
} from '..';
import { getTableGridAbove } from '../queries';

export const deleteRowWhenExpanded = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  [table, tablePath]: NodeEntry<TTableElement>
) => {
  const { api } = getEditorPlugin(editor, BaseTablePlugin);
  const columnCount = getTableMergedColumnCount(table);

  const cells = getTableGridAbove(editor, {
    format: 'cell',
  }) as NodeEntry<TTableCellElement>[];

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

      const rowSpan = api.getRowSpan(cell);

      rowSpanCarry = rowSpan && rowSpan > 1 ? rowSpan - 1 : 0;
      acrossRow += rowSpan ?? 1;
    }

    lastRowIndex = currentRowIndex;
  });

  if (acrossColumn === columnCount) {
    const pathRefs: PathRef[] = [];

    for (let i = firsRowIndex; i < firsRowIndex + acrossRow; i++) {
      const removedPath = tablePath.concat(i);
      pathRefs.push(tx.refs.path(removedPath));
    }

    pathRefs.forEach((pathRef) => {
      const path = pathRef.unref();

      if (path) tx.nodes.remove({ at: path });
    });
  }
};
