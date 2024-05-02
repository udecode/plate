import {
  getNodeEntry,
  getPreviousPath,
  TEditor,
  TElement,
  TNodeEntry,
  Value,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

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
