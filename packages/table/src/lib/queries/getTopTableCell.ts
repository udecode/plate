import type { Path, SlateEditor } from 'platejs';

import { getAdjacentTableCell } from './getAdjacentTableCell';

// Get cell to the top of the current cell
export const getTopTableCell = (
  editor: SlateEditor,
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
