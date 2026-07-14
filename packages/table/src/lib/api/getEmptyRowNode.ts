import type { BaseEditor } from '@platejs/core';

import { KEYS } from '@platejs/utils';

import type { TableConfig } from '../BaseTablePlugin';
import type { CreateCellOptions } from '../types';

export interface GetEmptyRowNodeOptions extends CreateCellOptions {
  colCount?: number;
}

export const getEmptyRowNode = (
  editor: BaseEditor,
  { colCount = 1, ...cellOptions }: GetEmptyRowNodeOptions = {}
) => {
  const { api } = editor.getPlugin<TableConfig>({ key: KEYS.table });

  return {
    children: Array.from({ length: colCount })
      .fill(colCount)
      .map(() => api.table.createCell(cellOptions)),
    type: editor.getType(KEYS.tr),
  };
};
