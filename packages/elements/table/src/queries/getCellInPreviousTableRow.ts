import { Ancestor, Editor, NodeEntry, Path } from 'slate';

export function getCellInPreviousTableRow(
  editor: Editor,
  currentRowPath: Path
): NodeEntry | undefined {
  try {
    const previousRow = Editor.node(
      editor,
      Path.previous(currentRowPath)
    ) as NodeEntry<Ancestor>;
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
