import type { Element, NodeEntry, Path } from '@platejs/slate';
import { PathApi } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

export const getCellInPreviousTableRow = (
  editor: SlateEditor,
  currentRowPath: Path
): NodeEntry | undefined => {
  if (!PathApi.hasPrevious(currentRowPath)) return;

  const prevPath = PathApi.previous(currentRowPath);

  const previousRow = editor.api.node<Element>(prevPath);

  if (!previousRow) return;

  const [previousRowNode, previousRowPath] = previousRow;
  const previousCell =
    previousRowNode?.children?.[previousRowNode.children.length - 1];
  const previousCellPath = previousRowPath.concat(
    previousRowNode.children.length - 1
  );

  if (previousCell && previousCellPath) {
    return editor.api.node(previousCellPath);
  }
};
