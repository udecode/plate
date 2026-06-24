import { node as getNode } from '../editor/node';
import type { Editor } from '../interfaces/editor';
import type { Node } from '../interfaces/node';
import type { Path } from '../interfaces/path';

export const matchPath = (
  editor: Editor,
  path: Path
): ((node: Node) => boolean) => {
  const [node] = getNode(editor, path);
  return (n) => n === node;
};
