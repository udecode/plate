import {
  type SlateEditor,
  getEditorPlugin,
  getParentNode,
} from '@udecode/plate-common';

import {
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
    colSizes: colSizesProp,
    element,
  }: { element: TTableCellElement; colSizes?: number[] }
) => {
  const { api } = getEditorPlugin<TableConfig>(editor, {
    key: 'table',
  });
  const path = editor.findPath(element)!;

  const [rowElement, rowPath] = getParentNode<TTableRowElement>(editor, path)!;
  const [tableNode] = getParentNode<TTableElement>(editor, rowPath)!;

  const colSizes = colSizesProp ?? getTableOverriddenColSizes(tableNode);
  const colSpan = api.table.getColSpan(element);

  const { col } = getCellIndices(editor, {
    cellNode: element,
    tableNode,
  });

  const width = (colSizes ?? [])
    .slice(col, col + colSpan)
    .reduce((total, w) => total + (w || 0), 0);

  return { minHeight: rowElement?.size, width };
};
