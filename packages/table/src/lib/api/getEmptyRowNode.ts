import type { SlateEditor } from '@udecode/plate';

import type { CreateCellOptions } from '../types';

import { type TableConfig, BaseTableRowPlugin } from '../BaseTablePlugin';

export interface GetEmptyRowNodeOptions extends CreateCellOptions {
  colCount?: number;
}

export const getEmptyRowNode = (
  editor: SlateEditor,
  { colCount = 1, ...cellOptions }: GetEmptyRowNodeOptions = {}
) => {
  const { api } = editor.getPlugin<TableConfig>({ key: 'table' });

  return {
    children: Array.from({ length: colCount })
      .fill(colCount)
      .map(() => api.create.tableCell(cellOptions)),
    type: editor.getType(BaseTableRowPlugin),
  };
};
