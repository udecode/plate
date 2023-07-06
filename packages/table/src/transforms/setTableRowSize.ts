import {
  GetAboveNodeOptions,
  TEditor,
  Value,
  findNode,
  setNodes,
} from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { TTableElement, TTableRowElement } from '../types';

export const setTableRowSize = <V extends Value>(
  editor: TEditor<V>,
  { rowIndex, height }: { rowIndex: number; height: number },
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
