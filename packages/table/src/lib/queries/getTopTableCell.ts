import { type Path, type SlateEditor, PathApi } from '@udecode/plate';

import type { TTableCellElement } from '../types';

import { getCellTypes } from '../utils/index';

// Get cell to the top of the current cell
export const getTopTableCell = (
  editor: SlateEditor,
  {
    at: cellPath,
  }: {
    at?: Path;
  } = {}
) => {
  if (!cellPath) {
    cellPath = editor.api.node<TTableCellElement>({
      match: { type: getCellTypes(editor) },
    })?.[1];

    if (!cellPath) return;
  }

  const cellIndex = cellPath.at(-1)!;
  const rowIndex = cellPath.at(-2)!;

  // If the current cell is in the first row, there is no cell above it
  if (rowIndex === 0) return;

  const cellAbovePath = [
    ...PathApi.parent(PathApi.parent(cellPath)),
    rowIndex - 1,
    cellIndex,
  ];

  return editor.api.node<TTableCellElement>(cellAbovePath);
};
