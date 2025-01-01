import {
  type SlateEditor,
  getEditorPlugin,
  getParentNode,
} from '@udecode/plate-common';

import {
  type CellIndices,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
  type TableConfig,
  getCellIndices,
  getTableOverriddenColSizes,
} from '..';

/** Get the width of a cell with colSpan support. */
export const getTableCellSize = (
  editor: SlateEditor,
  {
    cellIndices,
    colSizes,
    element,
    rowSize,
  }: {
    element: TTableCellElement;
    cellIndices?: CellIndices;
    colSizes?: number[];
    rowSize?: number;
  }
) => {
  const { api } = getEditorPlugin<TableConfig>(editor, {
    key: 'table',
  });
  const path = editor.api.findPath(element)!;

  if (!rowSize) {
    const [rowElement] = getParentNode<TTableRowElement>(editor, path)!;
    rowSize = rowElement.size;
  }
  if (!colSizes) {
    const [, rowPath] = getParentNode<TTableRowElement>(editor, path)!;
    const [tableNode] = getParentNode<TTableElement>(editor, rowPath)!;
    colSizes = getTableOverriddenColSizes(tableNode);
  }

  const colSpan = api.table.getColSpan(element);

  const { col } = cellIndices ?? getCellIndices(editor, element);

  const width = (colSizes ?? [])
    .slice(col, col + colSpan)
    .reduce((total, w) => total + (w || 0), 0);

  return { minHeight: rowSize, width };
};
