import {
  type NodeEntry,
  type PathRef,
  type BasePlateEditor,
  type TTableCellElement,
  KEYS,
  NodeApi,
  RangeApi,
} from 'platejs';

import { getTableGridAbove } from '../queries';

export const deleteColumnWhenExpanded = (
  editor: BasePlateEditor,
  tableEntry: NodeEntry<TTableCellElement>
) => {
  const [start, end] = RangeApi.edges(editor.selection!);
  const firstRow = NodeApi.child(tableEntry[0], 0) as TTableCellElement;
  const lastRow = NodeApi.child(
    tableEntry[0],
    tableEntry[0].children.length - 1
  ) as TTableCellElement;

  const firstSelectionRow = editor.api.above({
    at: start,
    match: (n) => n.type === KEYS.tr,
  });

  const lastSelectionRow = editor.api.above({
    at: end,
    match: (n) => n.type === KEYS.tr,
  });

  if (!firstSelectionRow || !lastSelectionRow) return;
  if (
    firstRow.id === firstSelectionRow[0].id &&
    lastSelectionRow[0].id === lastRow.id
  )
    deleteSelection(editor);
};

const deleteSelection = (editor: BasePlateEditor) => {
  const cells = getTableGridAbove(editor, {
    format: 'cell',
  }) as NodeEntry<TTableCellElement>[];

  const pathRefs: PathRef[] = [];

  cells.forEach(([_cell, cellPath]) => {
    pathRefs.push(editor.api.pathRef(cellPath));
  });

  pathRefs.forEach((pathRef) => {
    editor.update((tx) => {
      tx.nodes.remove({ at: pathRef.unref()! });
    });
  });
};
