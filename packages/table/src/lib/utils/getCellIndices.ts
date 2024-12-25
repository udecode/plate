import type { SlateEditor } from '@udecode/plate-common';

import type { TableConfig } from '../BaseTablePlugin';
import type { TTableCellElement, TTableElement } from '../types';

import { computeCellIndices } from './computeCellIndices';

export const getCellIndices = (
  editor: SlateEditor,
  {
    cellNode,
    tableNode,
  }: {
    cellNode: TTableCellElement;
    tableNode: TTableElement;
  }
) => {
  const cellIndices = editor.getOptions<TableConfig>({
    key: 'table',
  })._cellIndices!;

  // optional typing needs for tests
  return (
    cellIndices.get(cellNode) ??
    computeCellIndices(editor, { cellNode, tableNode })
  );
};
