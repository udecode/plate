import { getNode, TEditor, TNodeEntry } from '@udecode/plate-core';
import { Ancestor, Editor, Path } from 'slate';

export function getCellInNextTableRow(
  editor: TEditor,
  currentRowPath: Path
): TNodeEntry | undefined {
  try {
    const nextRow = getNode(
      editor,
      Path.next(currentRowPath)
    ) as TNodeEntry<Ancestor>;
    // TODO: Many tables in rich text editors (Google Docs, Word),
    // add a new row if we're in the last cell. Should we do the same?
    const [nextRowNode, nextRowPath] = nextRow;
    const nextCell = nextRowNode?.children?.[0];
    const nextCellPath = nextRowPath.concat(0);
    if (nextCell && nextCellPath) {
      return getNode(editor, nextCellPath);
    }
  } catch (err) {}
}
