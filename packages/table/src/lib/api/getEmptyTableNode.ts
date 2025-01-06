import type { SlateEditor } from '@udecode/plate';

import type { TTableElement } from '../types';
import type { GetEmptyRowNodeOptions } from './getEmptyRowNode';

import { type TableConfig, BaseTablePlugin } from '../BaseTablePlugin';

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
  const { api } = editor.getPlugin<TableConfig>({ key: 'table' });

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
    type: editor.getType(BaseTablePlugin),
  };
};
