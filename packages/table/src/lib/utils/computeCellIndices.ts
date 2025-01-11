import { type SlateEditor, getEditorPlugin } from '@udecode/plate';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';

export function computeCellIndices(
  editor: SlateEditor,
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
    key: 'table',
  });

  if (!tableNode) {
    if (!cellNode) return;

    tableNode = editor.api.above<TTableElement>({
      at: cellNode,
      match: { type: editor.getType(BaseTablePlugin) },
    })?.[0];

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
      const prevIndicesForCell = prevIndices[cellElement.id!];

      // Check if indices changed for this cell
      if (
        prevIndicesForCell?.col !== currentIndices.col ||
        prevIndicesForCell?.row !== currentIndices.row
      ) {
        hasIndicesChanged = true;
      }

      cellIndices[cellElement.id!] = currentIndices;

      if (cellElement.id === cellNode?.id) {
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
