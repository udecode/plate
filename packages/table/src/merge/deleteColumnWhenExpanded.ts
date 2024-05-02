import {
  type PlateEditor,
  type TNodeEntry,
  type Value,
  createPathRef,
  getAboveNode,
  removeNodes,
} from '@udecode/plate-common/server';
import { Node, type PathRef, Range } from 'slate';

import type { TTableCellElement } from '../types';

import { ELEMENT_TR } from '../createTablePlugin';
import { getTableGridAbove } from '../queries';

export const deleteColumnWhenExpanded = <V extends Value>(
  editor: PlateEditor<V>,
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
    match: (n) => n.type === ELEMENT_TR,
  });

  const lastSelectionRow = getAboveNode(editor, {
    at: end,
    match: (n) => n.type === ELEMENT_TR,
  });

  if (!firstSelectionRow || !lastSelectionRow) return;
  if (
    firstRow.id === firstSelectionRow[0].id &&
    lastSelectionRow[0].id === lastRow.id
  )
    deleteSelection(editor);
};

const deleteSelection = <V extends Value>(editor: PlateEditor<V>) => {
  const cells = getTableGridAbove(editor, {
    format: 'cell',
  }) as TNodeEntry<TTableCellElement>[];

  const pathRefs: PathRef[] = [];

  cells.forEach(([cell, cellPath], index) => {
    pathRefs.push(createPathRef(editor, cellPath));
  });

  pathRefs.forEach((pathRef) => {
    removeNodes(editor, { at: pathRef.unref()! });
  });
};
