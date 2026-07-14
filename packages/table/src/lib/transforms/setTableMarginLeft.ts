import type { BaseEditor } from '@platejs/core';
import type { TTableElement } from '@platejs/utils';

import { KEYS } from '@platejs/utils';
import type { TableFindOptions } from '../types';

export const setTableMarginLeft = (
  editor: BaseEditor,
  { marginLeft }: { marginLeft: number },
  options: TableFindOptions = {}
) => {
  const table = editor.read.nodes.find<TTableElement>({
    match: { type: editor.getType(KEYS.table) },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;

  editor.update.nodes.set<TTableElement>({ marginLeft }, { at: tablePath });
};
