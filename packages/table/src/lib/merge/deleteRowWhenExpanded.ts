import {
  type NodeEntry,
  type PathRef,
  type SlateEditor,
  getEditorPlugin,
} from '@udecode/plate';

import {
  type TTableCellElement,
  BaseTablePlugin,
  getCellRowIndexByPath,
  getTableMergedColumnCount,
} from '..';
import { getTableGridAbove } from '../queries';

export const deleteRowWhenExpanded = (
  editor: SlateEditor,
  [table, tablePath]: NodeEntry<TTableCellElement>
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

      const rowSpan = api.table.getRowSpan(cell);

      rowSpanCarry = rowSpan && rowSpan > 1 ? rowSpan - 1 : 0;
      acrossRow += rowSpan ?? 1;
    }

    lastRowIndex = currentRowIndex;
  });

  if (acrossColumn === columnCount) {
    const pathRefs: PathRef[] = [];

    for (let i = firsRowIndex; i < firsRowIndex + acrossRow; i++) {
      const removedPath = tablePath.concat(i);
      pathRefs.push(editor.api.pathRef(removedPath));
    }

    pathRefs.forEach((item) => {
      editor.tf.removeNodes({ at: item.unref()! });
    });
  }
};
