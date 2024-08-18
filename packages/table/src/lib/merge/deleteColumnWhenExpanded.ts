import {
  type SlateEditor,
  type TNodeEntry,
  createPathRef,
  getAboveNode,
  removeNodes,
} from '@udecode/plate-common';
import { Node, type PathRef, Range } from 'slate';

import type { TTableCellElement } from '../types';

import { TableRowPlugin } from '../TablePlugin';
import { getTableGridAbove } from '../queries';

export const deleteColumnWhenExpanded = (
  editor: SlateEditor,
  tableEntry: TNodeEntry<TTableCellElement>
) => {
  const [start, end] = Range.edges(editor.selection!);
  const firstRow = Node.child(tableEntry[0], 0) as TTableCellElement;
  const lastRow = Node.child(
    tableEntry[0],
    tableEntry[0].children.length - 1
  ) as TTableCellElement;

  const firstSelectionRow = getAboveNode(editor, {
    at: start,
    match: (n) => n.type === TableRowPlugin.key,
  });

  const lastSelectionRow = getAboveNode(editor, {
    at: end,
    match: (n) => n.type === TableRowPlugin.key,
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
  }) as TNodeEntry<TTableCellElement>[];

  const pathRefs: PathRef[] = [];

  cells.forEach(([_cell, cellPath]) => {
    pathRefs.push(createPathRef(editor, cellPath));
  });

  pathRefs.forEach((pathRef) => {
    removeNodes(editor, { at: pathRef.unref()! });
  });
};
