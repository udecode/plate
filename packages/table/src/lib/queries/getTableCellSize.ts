import type {
  SlateEditor,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from 'platejs';

import { getEditorPlugin, KEYS } from 'platejs';

import {
  type CellIndices,
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
    key: KEYS.table,
  });
  const path = editor.api.findPath(element)!;

  if (!rowSize) {
    const [rowElement] = editor.api.parent<TTableRowElement>(path) ?? [];

    if (!rowElement || rowElement.type !== editor.getType(KEYS.tr)) {
      return { minHeight: 0, width: 0 };
    }

    rowSize = rowElement.size ?? 0;
  }
  if (!colSizes) {
    const [, rowPath] = editor.api.parent<TTableRowElement>(path) ?? [];

    if (!rowPath) return { minHeight: rowSize, width: 0 };

    const [tableNode] = editor.api.parent<TTableElement>(rowPath) ?? [];

    if (!tableNode) return { minHeight: rowSize, width: 0 };

    colSizes = getTableOverriddenColSizes(tableNode);
  }

  const colSpan = api.table.getColSpan(element);

  const { col } = cellIndices ?? getCellIndices(editor, element);

  const width = (colSizes ?? [])
    .slice(col, col + colSpan)
    .reduce((total, w) => total + (w || 0), 0);

  return { minHeight: rowSize, width };
};
