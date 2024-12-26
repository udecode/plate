import { type SlateEditor, getEditorPlugin } from '@udecode/plate-common';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';
import { getTableRowIndex } from '../queries';
import { getTableColumnIndex } from '../queries/getTableColumnIndex';

export function computeCellIndices(
  editor: SlateEditor,
  {
    cellNode,
    tableNode,
  }: {
    tableNode: TTableElement;
    cellNode?: TTableCellElement;
  }
) {
  const { api, getOptions, setOption } = getEditorPlugin<
    typeof BaseTablePlugin
  >(editor, {
    key: 'table',
  });
  const { _cellIndices } = getOptions();

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
      _cellIndices!.set(cellElement, currentIndices);
      editor.setOption(BaseTablePlugin, '_cellIndices', _cellIndices);

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

  if (!targetIndices && cellNode) {
    const defaultColIndex = getTableColumnIndex(editor, cellNode);
    const defaultRowIndex = getTableRowIndex(editor, cellNode);

    _cellIndices!.set(cellNode, { col: defaultColIndex, row: defaultRowIndex });
    setOption('_cellIndices', _cellIndices);

    return { col: defaultColIndex, row: defaultRowIndex };
  }

  return targetIndices!;
}
