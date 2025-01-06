import {
  type Editor,
  type NodeEntry,
  type Path,
  type TElement,
  PathApi,
} from '@udecode/plate';

export const getCellInNextTableRow = (
  editor: Editor,
  currentRowPath: Path
): NodeEntry | undefined => {
  const nextRow = editor.api.node<TElement>(PathApi.next(currentRowPath));

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
