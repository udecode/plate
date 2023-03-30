import {
  findNode,
  GetAboveNodeOptions,
  setNodes,
  TEditor,
  Value,
} from '@udecode/plate-common';
import { ELEMENT_TABLE } from '../createTablePlugin';
import { TTableElement } from '../types';

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
