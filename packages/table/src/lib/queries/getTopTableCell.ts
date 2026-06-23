import type { Path, BasePlateEditor } from 'platejs';

import { getAdjacentTableCell } from './getAdjacentTableCell';

// Get cell to the top of the current cell
export const getTopTableCell = (
  editor: BasePlateEditor,
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
