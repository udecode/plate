import {
  type GetAboveNodeOptions,
  type TEditor,
  findNode,
  setNodes,
} from '@udecode/plate-common';

import type { TTableElement } from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const setTableMarginLeft = <E extends TEditor>(
  editor: E,
  { marginLeft }: { marginLeft: number },
  options: GetAboveNodeOptions<E> = {}
) => {
  const table = findNode<TTableElement>(editor, {
    match: { type: BaseTablePlugin.key },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;

  setNodes<TTableElement>(editor, { marginLeft }, { at: tablePath });
};
