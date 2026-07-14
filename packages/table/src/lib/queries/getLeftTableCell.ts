import type { Path } from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';

import { getAdjacentTableCell } from './getAdjacentTableCell';

// Get cell to the left of the current cell
export const getLeftTableCell = (
  editor: BaseEditor,
  {
    at: cellPath,
  }: {
    at?: Path;
  } = {}
) =>
  getAdjacentTableCell(editor, {
    at: cellPath,
    deltaCol: -1,
  });
