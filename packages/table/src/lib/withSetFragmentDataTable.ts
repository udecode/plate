import type { BaseEditor } from '@platejs/core';
import { NodeApi } from '@platejs/plite';
import type { TTableCellElement, TTableRowElement } from '@platejs/utils';

import { getTableGridAbove } from './queries';

/** Write table-specific CSV and TSV formats for a multi-cell selection. */
export const withSetFragmentDataTable = (
  editor: BaseEditor,
  data: Pick<DataTransfer, 'getData' | 'setData'>
) => {
  const cells = getTableGridAbove(editor, { format: 'cell' });

  if (cells.length <= 1) return false;

  const [tableEntry] = getTableGridAbove(editor, { format: 'table' });

  if (!tableEntry) return false;

  editor.api.clipboard.writeSelection(data);

  const rows = tableEntry[0].children as TTableRowElement[];
  const values = rows.map((row) =>
    (row.children as TTableCellElement[]).map((cell) => NodeApi.string(cell))
  );
  const csv = `${values.map((row) => row.join(',')).join('\n')}\n`;
  const tsv = `${values.map((row) => row.join('\t')).join('\n')}\n`;

  data.setData('text/csv', csv);
  data.setData('text/tsv', tsv);
  data.setData('text/plain', tsv);

  return true;
};
