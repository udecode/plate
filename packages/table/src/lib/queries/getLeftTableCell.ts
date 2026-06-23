import type { Path, BasePlateEditor } from 'platejs';

import { getAdjacentTableCell } from './getAdjacentTableCell';

// Get cell to the left of the current cell
export const getLeftTableCell = (
  editor: BasePlateEditor,
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
