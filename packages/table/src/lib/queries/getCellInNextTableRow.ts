import type { TEditor, TElement, TNodeEntry } from '@udecode/plate-common';

import { Path } from 'slate';

export const getCellInNextTableRow = (
  editor: TEditor,
  currentRowPath: Path
): TNodeEntry | undefined => {
  const nextRow = editor.api.node<TElement>(Path.next(currentRowPath));

  if (!nextRow) return;

  // TODO: Many tables in rich text editors (Google Docs, Word),
  // add a new row if we're in the last cell. Should we do the same?
  const [nextRowNode, nextRowPath] = nextRow;
  const nextCell = nextRowNode?.children?.[0];
  const nextCellPath = nextRowPath.concat(0);

  if (nextCell && nextCellPath) {
    return editor.api.node(nextCellPath);
  }
};
