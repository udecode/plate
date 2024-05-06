import {
  type GetAboveNodeOptions,
  type TEditor,
  type Value,
  findNode,
  setNodes,
} from '@udecode/plate-common/server';

import type { TTableElement, TTableRowElement } from '../types';

import { ELEMENT_TABLE } from '../createTablePlugin';

export const setTableRowSize = <V extends Value>(
  editor: TEditor<V>,
  { height, rowIndex }: { height: number; rowIndex: number },
  options: GetAboveNodeOptions<V> = {}
) => {
  const table = findNode<TTableElement>(editor, {
    match: { type: ELEMENT_TABLE },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;
  const tableRowPath = [...tablePath, rowIndex];

  setNodes<TTableRowElement>(editor, { size: height }, { at: tableRowPath });
};
