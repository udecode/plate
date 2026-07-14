import type { BaseEditor } from '@platejs/core';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import { getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  type CellIndices,
  type TableConfig,
  getCellIndices,
  getTableOverriddenColSizes,
} from '..';

/** Get the width of a cell with colSpan support. */
export const getTableCellSize = (
  editor: BaseEditor,
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
  const path = editor.read.nodes.path(element);

  if (!path) return { minHeight: rowSize ?? 0, width: 0 };

  if (!rowSize) {
    const [rowElement] = editor.read.nodes.parent<TTableRowElement>(path) ?? [];

    if (!rowElement || rowElement.type !== editor.getType(KEYS.tr)) {
      return { minHeight: 0, width: 0 };
    }

    rowSize = rowElement.size ?? 0;
  }
  if (!colSizes) {
    const [, rowPath] = editor.read.nodes.parent<TTableRowElement>(path) ?? [];

    if (!rowPath) return { minHeight: rowSize, width: 0 };

    const [tableNode] = editor.read.nodes.parent<TTableElement>(rowPath) ?? [];

    if (!tableNode) return { minHeight: rowSize, width: 0 };

    colSizes = getTableOverriddenColSizes(tableNode);
  }

  const colSpan = api.getColSpan(element);

  const { col } = cellIndices ?? getCellIndices(editor, element);

  const width = (colSizes ?? [])
    .slice(col, col + colSpan)
    .reduce((total, w) => total + (w || 0), 0);

  return { minHeight: rowSize, width };
};
