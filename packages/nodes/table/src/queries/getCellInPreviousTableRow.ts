import {
  getNodeEntry,
  TEditor,
  TElement,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';
import { Path } from 'slate';

export const getCellInPreviousTableRow = <V extends Value>(
  editor: TEditor<V>,
  currentRowPath: Path
): TNodeEntry | undefined => {
  const previousRow = getNodeEntry<TElement>(
    editor,
    Path.previous(currentRowPath)
  );
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
