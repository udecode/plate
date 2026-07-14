import {
  type EditorUpdateTransaction,
  type NodeEntry,
  type PathRef,
  NodeApi,
  RangeApi,
} from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import {
  KEYS,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from '@platejs/utils';

import { getTableGridAbove } from '../queries';
import { getCellTypes } from '../utils';

export const deleteColumnWhenExpanded = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  tableEntry: NodeEntry<TTableElement>
) => {
  const selection = editor.read.selection();

  if (!selection) return;

  const [start, end] = RangeApi.edges(selection);
  const firstRow = NodeApi.child(tableEntry[0], 0) as TTableRowElement;
  const lastRow = NodeApi.child(
    tableEntry[0],
    tableEntry[0].children.length - 1
  ) as TTableRowElement;

  const firstSelectionRow = editor.read.nodes.above({
    at: start,
    match: { type: editor.getType(KEYS.tr) },
  });

  const lastSelectionRow = editor.read.nodes.above({
    at: end,
    match: { type: editor.getType(KEYS.tr) },
  });

  if (!firstSelectionRow || !lastSelectionRow) return;
  if (
    firstRow.id === firstSelectionRow[0].id &&
    lastSelectionRow[0].id === lastRow.id
  ) {
    const cells = getTableGridAbove(editor, {
      format: 'cell',
    }) as NodeEntry<TTableCellElement>[];
    const allCells = editor.read.nodes.toArray<TTableCellElement>({
      at: tableEntry[1],
      match: { type: getCellTypes(editor) },
    });

    if (cells.length === allCells.length) {
      tx.nodes.remove({ at: tableEntry[1] });
      return;
    }

    deleteSelection(tx, cells);
  }
};

const deleteSelection = (
  tx: EditorUpdateTransaction,
  cells: NodeEntry<TTableCellElement>[]
) => {
  const pathRefs: PathRef[] = [];

  cells.forEach(([_cell, cellPath]) => {
    pathRefs.push(tx.refs.path(cellPath));
  });

  pathRefs.forEach((pathRef) => {
    const path = pathRef.unref();

    if (path) tx.nodes.remove({ at: path });
  });
};
