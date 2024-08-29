import type { AncestorEntryOf, ElementOrTextOf, TEditor } from '@udecode/slate';
import type { Path } from 'slate';

/**
 * Get the next sibling nodes after a path.
 *
 * @param ancestorEntry Ancestor of the sibling nodes
 * @param path Path of the reference node
 */
export const getNextSiblingNodes = <E extends TEditor>(
  ancestorEntry: AncestorEntryOf<E>,
  path: Path
): ElementOrTextOf<E>[] => {
  const [ancestor, ancestorPath] = ancestorEntry;

  const leafIndex = path[ancestorPath.length];

  const siblings: ElementOrTextOf<E>[] = [];
  const ancestorChildren = ancestor.children as ElementOrTextOf<E>[];

  if (leafIndex + 1 < ancestor.children.length) {
    for (let i = leafIndex + 1; i < ancestor.children.length; i++) {
      siblings.push(ancestorChildren[i]);
    }
  }

  return siblings;
};
