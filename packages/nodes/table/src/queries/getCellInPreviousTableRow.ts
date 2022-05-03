import { TEditor, TNodeEntry } from '@udecode/plate-core';
import { Ancestor, Editor, Path } from 'slate';

export function getCellInPreviousTableRow(
  editor: TEditor,
  currentRowPath: Path
): TNodeEntry | undefined {
  try {
    const previousRow = Editor.node(
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
      return Editor.node(editor, previousCellPath);
    }
  } catch (err) {}
}
