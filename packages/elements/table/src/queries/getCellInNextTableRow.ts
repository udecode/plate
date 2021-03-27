import { Ancestor, Editor, NodeEntry, Path } from 'slate';

export function getCellInNextTableRow(
  editor: Editor,
  currentRowPath: Path
): NodeEntry | undefined {
  try {
    const nextRow = Editor.node(
      editor,
      Path.next(currentRowPath)
    ) as NodeEntry<Ancestor>;
    // TODO: Many tables in rich text editors (Google Docs, Word),
    // add a new row if we're in the last cell. Should we do the same?
    const [nextRowNode, nextRowPath] = nextRow;
    const nextCell = nextRowNode?.children?.[0];
    const nextCellPath = nextRowPath.concat(0);
    if (nextCell && nextCellPath) {
      return Editor.node(editor, nextCellPath);
    }
  } catch (err) {}
}
