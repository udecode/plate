import {
  type NodeEntry,
  type PathRef,
  type SlateEditor,
  NodeApi,
  RangeApi,
} from '@udecode/plate';

import { type TTableCellElement, BaseTableRowPlugin } from '..';
import { getTableGridAbove } from '../queries';

export const deleteColumnWhenExpanded = (
  editor: SlateEditor,
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
    match: (n) => n.type === BaseTableRowPlugin.key,
  });

  const lastSelectionRow = editor.api.above({
    at: end,
    match: (n) => n.type === BaseTableRowPlugin.key,
  });

  if (!firstSelectionRow || !lastSelectionRow) return;
  if (
    firstRow.id === firstSelectionRow[0].id &&
    lastSelectionRow[0].id === lastRow.id
  )
    deleteSelection(editor);
};

const deleteSelection = (editor: SlateEditor) => {
  const cells = getTableGridAbove(editor, {
    format: 'cell',
  }) as NodeEntry<TTableCellElement>[];

  const pathRefs: PathRef[] = [];

  cells.forEach(([_cell, cellPath]) => {
    pathRefs.push(editor.api.pathRef(cellPath));
  });

  pathRefs.forEach((pathRef) => {
    editor.tf.removeNodes({ at: pathRef.unref()! });
  });
};
