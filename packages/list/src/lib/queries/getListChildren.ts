import type { Editor, Element, NodeEntry } from '@platejs/plite';
import { PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isDefined } from '@udecode/utils';

/**
 * Get all list items that are children of the current list item (have bigger
 * indent). Stops when encountering an item with equal or lower indent.
 */
export const getListChildren = <N extends Element = Element>(
  editor: Editor,
  entry: NodeEntry<Element>
): NodeEntry<N>[] => {
  const children: NodeEntry<N>[] = [];
  const [node, path] = entry;

  const parentIndent = node[KEYS.indent];

  // If no indent or not a list item, return empty
  if (typeof parentIndent !== 'number' || !isDefined(node[KEYS.listType])) {
    return children;
  }

  let currentPath = path;

  while (true) {
    const nextPath = PathApi.next(currentPath);
    if (!nextPath) break;

    const nextNode = editor.read.nodes.get<N>(nextPath)?.[0];
    if (!nextNode) break;

    const nextIndent = nextNode[KEYS.indent];

    // Stop if we hit a non-list item or item with equal/lower indent
    if (typeof nextIndent !== 'number' || !isDefined(nextNode[KEYS.listType])) {
      break;
    }

    if (nextIndent <= parentIndent) {
      break;
    }

    // This is a child item (bigger indent)
    children.push([nextNode, nextPath]);
    currentPath = nextPath;
  }

  return children;
};
