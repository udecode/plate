import type { Path, SlateEditor, TTableCellElement } from 'platejs';

import { PathApi } from 'platejs';

import { getCellTypes } from '../utils';

// Get cell to the left of the current cell
export const getLeftTableCell = (
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

  const cellIndex = cellPath.at(-1);

  if (!cellIndex) return;

  const prevCellPath = PathApi.previous(cellPath)!;

  return editor.api.node<TTableCellElement>(prevCellPath);
};
