import type { SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

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
