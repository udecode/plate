import { getNode, TEditor, TNodeEntry } from '@udecode/plate-core';
import { Ancestor, Editor, Path } from 'slate';

export function getCellInPreviousTableRow(
  editor: TEditor,
  currentRowPath: Path
): TNodeEntry | undefined {
  try {
    const previousRow = getNode(
      editor,
      Path.previous(currentRowPath)
    ) as TNodeEntry<Ancestor>;
    const [previousRowNode, previousRowPath] = previousRow;
    const previousCell =
      previousRowNode?.children?.[previousRowNode.children.length - 1];
    const previousCellPath = previousRowPath.concat(
      previousRowNode.children.length - 1
    );
    if (previousCell && previousCellPath) {
      return getNode(editor, previousCellPath);
    }
  } catch (err) {}
}
