import {
  findNode,
  GetAboveNodeOptions,
  setNodes,
  TEditor,
  Value,
} from '@udecode/plate-common';
import { ELEMENT_TR } from '../createTablePlugin';
import { TTableRowElement } from '../types';

export const setTableRowSize = <V extends Value>(
  editor: TEditor<V>,
  { height }: { height: number },
  options: GetAboveNodeOptions<V> = {}
) => {
  const tableRow = findNode<TTableRowElement>(editor, {
    match: { type: ELEMENT_TR },
    ...options,
  });
  if (!tableRow) return;

  const [, tableRowPath] = tableRow;

  setNodes<TTableRowElement>(editor, { size: height }, { at: tableRowPath });
};
