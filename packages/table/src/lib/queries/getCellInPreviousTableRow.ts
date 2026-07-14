import {
  type Editor,
  type NodeEntry,
  type Path,
  type Element,
  PathApi,
} from '@platejs/plite';

export const getCellInPreviousTableRow = (
  editor: Editor,
  currentRowPath: Path
): NodeEntry | undefined => {
  if (currentRowPath.at(-1) === 0) return;

  const prevPath = PathApi.previous(currentRowPath);

  const previousRow = editor.read.nodes.get<Element>(prevPath);

  if (!previousRow) return;

  const [previousRowNode, previousRowPath] = previousRow;
  const previousCell =
    previousRowNode?.children?.[previousRowNode.children.length - 1];
  const previousCellPath = previousRowPath.concat(
    previousRowNode.children.length - 1
  );

  if (previousCell && previousCellPath) {
    return editor.read.nodes.get(previousCellPath);
  }
};
