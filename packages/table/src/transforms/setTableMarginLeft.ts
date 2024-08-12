import {
  type GetAboveNodeOptions,
  type TEditor,
  type Value,
  findNode,
  setNodes,
} from '@udecode/plate-common';

import type { TTableElement } from '../types';

import { ELEMENT_TABLE } from '../TablePlugin';

export const setTableMarginLeft = <V extends Value>(
  editor: TEditor<V>,
  { marginLeft }: { marginLeft: number },
  options: GetAboveNodeOptions<V> = {}
) => {
  const table = findNode<TTableElement>(editor, {
    match: { type: ELEMENT_TABLE },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;

  setNodes<TTableElement>(editor, { marginLeft }, { at: tablePath });
};
