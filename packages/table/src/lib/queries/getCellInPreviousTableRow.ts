import {
  type Editor,
  type NodeEntry,
  type Path,
  type TElement,
  PathApi,
} from '@udecode/plate';

export const getCellInPreviousTableRow = (
  editor: Editor,
  currentRowPath: Path
): NodeEntry | undefined => {
  const prevPath = PathApi.previous(currentRowPath);

  if (!prevPath) return;

  const previousRow = editor.api.node<TElement>(prevPath);

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
