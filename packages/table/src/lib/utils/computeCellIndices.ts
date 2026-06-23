import { ElementApi, NodeApi, type Node } from '@platejs/plite';
import {
  type BasePlateEditor,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
  getEditorPlugin,
  KEYS,
} from 'platejs';

import type { BaseTablePlugin } from '../BaseTablePlugin';
import { findTableNodePath } from './findTableNodePath';

const findTableNodeByCellId = (
  editor: BasePlateEditor,
  nodes: readonly unknown[],
  cellId: string | undefined
): TTableElement | undefined => {
  if (!cellId) return;

  for (const node of nodes) {
    if (!ElementApi.isElement(node)) continue;

    if (node.type === editor.getType(KEYS.table)) {
      const table = node as TTableElement;

      for (const row of table.children as TTableRowElement[]) {
        if (
          (row.children as TTableCellElement[]).some(
            (cell) => cell.id === cellId
          )
        ) {
          return table;
        }
      }
    }

    const nestedTable = findTableNodeByCellId(editor, node.children, cellId);

    if (nestedTable) return nestedTable;
  }
};

export function computeCellIndices(
  editor: BasePlateEditor,
  {
    all,
    cellNode,
    tableNode,
  }: {
    all?: boolean;
    cellNode?: TTableCellElement;
    tableNode?: TTableElement;
  }
) {
  const { api, getOptions, setOption } = getEditorPlugin<
    typeof BaseTablePlugin
  >(editor, {
    key: KEYS.table,
  });

  if (!tableNode) {
    if (!cellNode) return;

    const cellPath = findTableNodePath(editor, cellNode);
    const tablePath = cellPath?.slice(0, -2);

    tableNode = tablePath
      ? (NodeApi.get(editor as unknown as Node, tablePath) as TTableElement)
      : undefined;

    tableNode ??= findTableNodeByCellId(editor, editor.children, cellNode.id);

    if (!tableNode) return;
  }

  const { _cellIndices: prevIndices } = getOptions();

  // Store previous indices to check for changes
  const cellIndices = { ...prevIndices };
  let hasIndicesChanged = false;

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
      const cellId = cellElement.id;
      const prevIndicesForCell = cellId ? prevIndices[cellId] : undefined;

      // Check if indices changed for this cell
      if (cellId) {
        if (
          prevIndicesForCell?.col !== currentIndices.col ||
          prevIndicesForCell?.row !== currentIndices.row
        ) {
          hasIndicesChanged = true;
        }

        cellIndices[cellId] = currentIndices;
      }

      if (
        cellElement === cellNode ||
        (cellId !== undefined && cellId === cellNode?.id)
      ) {
        targetIndices = currentIndices;

        if (!all) break;
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
  }

  if (hasIndicesChanged) {
    setOption('_cellIndices', cellIndices);
  }

  return targetIndices;
}
