import {
  type GetAboveNodeOptions,
  type SlateEditor,
  findNode,
  setNodes,
} from '@udecode/plate-common';

import type { TTableElement } from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const setTableMarginLeft = (
  editor: SlateEditor,
  { marginLeft }: { marginLeft: number },
  options: GetAboveNodeOptions = {}
) => {
  const table = findNode<TTableElement>(editor, {
    match: { type: BaseTablePlugin.key },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;

  setNodes<TTableElement>(editor, { marginLeft }, { at: tablePath });
};
