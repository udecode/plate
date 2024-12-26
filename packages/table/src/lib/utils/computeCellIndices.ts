import {
  type SlateEditor,
  getAboveNode,
  getEditorPlugin,
} from '@udecode/plate-common';

import type { BaseTablePlugin } from '../BaseTablePlugin';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

export function computeCellIndices(
  editor: SlateEditor,
  {
    cellNode,
    tableNode,
  }: {
    cellNode?: TTableCellElement;
    tableNode?: TTableElement;
  }
) {
  if (!tableNode) {
    if (!cellNode) return;

    tableNode = getAboveNode<TTableElement>(editor, {
      at: editor.findPath(cellNode),
    })?.[0];

    if (!tableNode) return;
  }

  const { api, getOptions } = getEditorPlugin<typeof BaseTablePlugin>(editor, {
    key: 'table',
  });
  const cellIndices = getOptions()._cellIndices!;

  const skipCells: boolean[][] = [];
  let targetIndices: { col: number; row: number } | undefined;

  for (let rowIndex = 0; rowIndex < tableNode.children.length; rowIndex++) {
    const row = tableNode.children[rowIndex] as TTableRowElement;
    let colIndex = 0;

    for (const cellElement of row.children as TTableCellElement[]) {
      while (skipCells[rowIndex]?.[colIndex]) {
        colIndex++;
      }

      const currentIndices = { col: colIndex, row: rowIndex };
      cellIndices[cellElement.id!] = currentIndices;

      if (cellElement === cellNode) {
        targetIndices = currentIndices;

        break;
      }

      const colSpan = api.table.getColSpan(cellElement);
      const rowSpan = api.table.getRowSpan(cellElement);

      for (let r = 0; r < rowSpan; r++) {
        skipCells[rowIndex + r] = skipCells[rowIndex + r] || [];

        for (let c = 0; c < colSpan; c++) {
          skipCells[rowIndex + r][colIndex + c] = true;
        }
      }

      colIndex += colSpan;
    }

    if (targetIndices) break;
  }

  return targetIndices;
}
