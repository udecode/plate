import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import type { TableConfig } from '../BaseTablePlugin';
import type { CreateCellOptions } from '../types';

export interface GetEmptyRowNodeOptions extends CreateCellOptions {
  colCount?: number;
}

export const getEmptyRowNode = (
  editor: SlateEditor,
  { colCount = 1, ...cellOptions }: GetEmptyRowNodeOptions = {}
) => {
  const { api } = editor.getPlugin<TableConfig>({ key: KEYS.table });

  return {
    children: Array.from({ length: colCount })
      .fill(colCount)
      .map(() => api.create.tableCell(cellOptions)),
    type: editor.getType(KEYS.tr),
  };
};
