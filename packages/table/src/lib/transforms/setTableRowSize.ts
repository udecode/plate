import {
  type GetAboveNodeOptions,
  type TEditor,
  findNode,
  setNodes,
} from '@udecode/plate-common';

import type { TTableElement, TTableRowElement } from '../types';

import { TablePlugin } from '../TablePlugin';

export const setTableRowSize = <E extends TEditor>(
  editor: E,
  { height, rowIndex }: { height: number; rowIndex: number },
  options: GetAboveNodeOptions<E> = {}
) => {
  const table = findNode<TTableElement>(editor, {
    match: { type: TablePlugin.key },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;
  const tableRowPath = [...tablePath, rowIndex];

  setNodes<TTableRowElement>(editor, { size: height }, { at: tableRowPath });
};
