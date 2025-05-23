import type { SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TableConfig } from '../BaseTablePlugin';
import type { TTableElement } from '../types';
import type { GetEmptyRowNodeOptions } from './getEmptyRowNode';

export interface GetEmptyTableNodeOptions extends GetEmptyRowNodeOptions {
  rowCount?: number;
}

export const getEmptyTableNode = (
  editor: SlateEditor,
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
      api.create.tableRow({
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
