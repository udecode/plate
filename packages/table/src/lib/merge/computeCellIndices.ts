import type { SlateEditor } from '@udecode/plate-common';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';
import { getColSpan } from '../queries';
import { getRowSpan } from '../queries/getRowSpan';

export function computeCellIndices(
  editor: SlateEditor,
  tableNode: TTableElement,
  cellNode?: TTableCellElement
) {
  const options = editor.getOptions(BaseTablePlugin);

  const skipCells: boolean[][] = [];
  let targetIndices: { col: number; row: number } | null = null;

  for (let rowIndex = 0; rowIndex < tableNode.children.length; rowIndex++) {
    const row = tableNode.children[rowIndex] as TTableRowElement;
    let colIndex = 0;

    for (const cellElement of row.children as TTableCellElement[]) {
      while (skipCells[rowIndex]?.[colIndex]) {
        colIndex++;
      }

      const currentIndices = { col: colIndex, row: rowIndex };
      options._cellIndices?.set(cellElement, currentIndices);

      if (cellElement === cellNode) {
        targetIndices = currentIndices;
      }

      const colSpan = getColSpan(cellElement);
      const rowSpan = getRowSpan(cellElement);

      for (let r = 0; r < rowSpan; r++) {
        skipCells[rowIndex + r] = skipCells[rowIndex + r] || [];

        for (let c = 0; c < colSpan; c++) {
          skipCells[rowIndex + r][colIndex + c] = true;
        }
      }

      colIndex += colSpan;
    }
  }

  return targetIndices;
}
