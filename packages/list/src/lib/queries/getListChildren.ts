import type { Editor, ElementEntryOf, ElementOf, NodeEntry } from 'platejs';

import { isDefined, KEYS, NodeApi, PathApi } from 'platejs';

/**
 * Get all list items that are children of the current list item (have bigger
 * indent). Stops when encountering an item with equal or lower indent.
 */
export const getListChildren = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entry: ElementEntryOf<E>
): NodeEntry<N>[] => {
  const children: NodeEntry<N>[] = [];
  const [node, path] = entry;

  const parentIndent = (node as any)[KEYS.indent] as number;

  // If no indent or not a list item, return empty
  if (!isDefined(parentIndent) || !isDefined((node as any)[KEYS.listType])) {
    return children;
  }

  let currentPath = path;

  while (true) {
    const nextPath = PathApi.next(currentPath);
    if (!nextPath) break;

    const nextNode = NodeApi.get<N>(editor, nextPath);
    if (!nextNode) break;

    const nextIndent = (nextNode as any)[KEYS.indent] as number;

    // Stop if we hit a non-list item or item with equal/lower indent
    if (
      !isDefined(nextIndent) ||
      !isDefined((nextNode as any)[KEYS.listType])
    ) {
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
