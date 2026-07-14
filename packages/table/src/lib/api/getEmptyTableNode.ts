import type { BaseEditor } from '@platejs/core';
import type { TTableElement } from '@platejs/utils';

import { KEYS } from '@platejs/utils';

import type { TableConfig } from '../BaseTablePlugin';
import type { GetEmptyRowNodeOptions } from './getEmptyRowNode';

export interface GetEmptyTableNodeOptions extends GetEmptyRowNodeOptions {
  rowCount?: number;
}

export const getEmptyTableNode = (
  editor: BaseEditor,
  {
    colCount,
    header,
    rowCount = 0,
    ...cellOptions
  }: GetEmptyTableNodeOptions = {}
): TTableElement => {
  const { api } = editor.getPlugin<TableConfig>({ key: KEYS.table });

  const rows = Array.from({ length: rowCount })
    .fill(rowCount)
    .map((_, index) =>
      api.table.createRow({
        colCount,
        ...cellOptions,
        header: header && index === 0,
      })
    );

  return {
    children: rows,
    type: editor.getType(KEYS.table),
  };
};
