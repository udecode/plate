import type { SlateEditor } from '@udecode/plate-common';

import type { TableConfig } from '../BaseTablePlugin';
import type { TTableCellElement } from '../types';

export type CellIndices = {
  col: number;
  row: number;
};

export const getCellIndices = (
  editor: SlateEditor,
  element: TTableCellElement
): CellIndices => {
  const cellIndices = editor.getOptions<TableConfig>({
    key: 'table',
  })._cellIndices;

  const indices = cellIndices[element.id!];

  if (!indices) {
    editor.api.debug.warn(
      'No cell indices found for element. Make sure all table cells have an id.',
      'TABLE_CELL_INDICES'
    );

    return { col: 0, row: 0 };
  }

  return indices;
};
