import type { Path } from 'slate';

import {
  type TEditor,
  type TElement,
  type TNodeEntry,
  type Value,
  getNodeEntry,
  getPreviousPath,
} from '@udecode/plate-common/server';

export const getCellInPreviousTableRow = <V extends Value>(
  editor: TEditor<V>,
  currentRowPath: Path
): TNodeEntry | undefined => {
  const prevPath = getPreviousPath(currentRowPath);

  if (!prevPath) return;

  const previousRow = getNodeEntry<TElement>(editor, prevPath);

  if (!previousRow) return;

  const [previousRowNode, previousRowPath] = previousRow;
  const previousCell =
    previousRowNode?.children?.[previousRowNode.children.length - 1];
  const previousCellPath = previousRowPath.concat(
    previousRowNode.children.length - 1
  );

  if (previousCell && previousCellPath) {
    return getNodeEntry(editor, previousCellPath);
  }
};
