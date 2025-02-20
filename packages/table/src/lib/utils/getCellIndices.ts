import { type SlateEditor, getEditorPlugin } from '@udecode/plate';

import type { TableConfig } from '../BaseTablePlugin';
import type { TTableCellElement } from '../types';

import { computeCellIndices } from './computeCellIndices';

export type CellIndices = {
  col: number;
  row: number;
};

export const getCellIndices = (
  editor: SlateEditor,
  element: TTableCellElement
): CellIndices => {
  const { getOption } = getEditorPlugin<TableConfig>(editor, {
    key: 'table',
  });

  let indices = getOption('cellIndices', element.id!);

  if (!indices) {
    indices = computeCellIndices(editor, {
      cellNode: element,
    })!;

    if (!indices) {
      editor.api.debug.warn(
        'No cell indices found for element. Make sure all table cells have an id.',
        'TABLE_CELL_INDICES'
      );
    }
  }

  return indices ?? { col: 0, row: 0 };
};
