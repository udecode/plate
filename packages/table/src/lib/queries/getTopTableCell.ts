import type { Path } from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';

import { getAdjacentTableCell } from './getAdjacentTableCell';

// Get cell to the top of the current cell
export const getTopTableCell = (
  editor: BaseEditor,
  {
    at: cellPath,
  }: {
    at?: Path;
  } = {}
) =>
  getAdjacentTableCell(editor, {
    at: cellPath,
    deltaRow: -1,
  });
