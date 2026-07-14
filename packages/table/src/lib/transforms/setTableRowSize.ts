import type { BaseEditor } from '@platejs/core';
import type { TTableElement, TTableRowElement } from '@platejs/utils';

import { KEYS } from '@platejs/utils';
import type { TableFindOptions } from '../types';

export const setTableRowSize = (
  editor: BaseEditor,
  { height, rowIndex }: { height: number; rowIndex: number },
  options: TableFindOptions = {}
) => {
  const table = editor.read.nodes.find<TTableElement>({
    match: { type: editor.getType(KEYS.table) },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;
  const tableRowPath = [...tablePath, rowIndex];

  editor.update.nodes.set<TTableRowElement>(
    { size: height },
    {
      at: tableRowPath,
    }
  );
};
