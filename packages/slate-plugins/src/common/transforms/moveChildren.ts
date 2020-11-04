import { Editor, Node, NodeEntry, Path, Transforms } from 'slate';

export interface Options {
  start?: number;
  pass?(entry: NodeEntry): boolean;
}

/**
 * Extracts the children from a list item moving them outside the list
 */
export function moveChildren(
  editor: Editor,
  parent: NodeEntry | Path,
  to: Path,
  options: Options = {}
) {
  let moved = 0;
  const { pass, start = 0 } = options;
  const parentPath = Path.isPath(parent) ? parent : parent[1];
  const parentNode = Path.isPath(parent)
    ? Node.get(editor, parentPath)
    : parent[0];
  if (!Editor.isBlock(editor, parentNode)) return;

  for (let i = parentNode.children.length - 1; i >= start; i--) {
    const childPath = [...parentPath, i];
    if (!pass || pass([Node.get(editor, childPath), childPath])) {
      Transforms.moveNodes(editor, { at: childPath, to });
      moved++;
    }
  }
  return moved;
}
