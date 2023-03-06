import { EAncestorEntry, EElementOrText, Value } from '@udecode/slate';
import { Path } from 'slate';

/**
 * Get the next sibling nodes after a path.
 * @param ancestorEntry Ancestor of the sibling nodes
 * @param path Path of the reference node
 */
export const getNextSiblingNodes = <V extends Value>(
  ancestorEntry: EAncestorEntry<V>,
  path: Path
): EElementOrText<V>[] => {
  const [ancestor, ancestorPath] = ancestorEntry;

  const leafIndex = path[ancestorPath.length];

  const siblings: EElementOrText<V>[] = [];
  const ancestorChildren = ancestor.children as EElementOrText<V>[];

  if (leafIndex + 1 < ancestor.children.length) {
    for (let i = leafIndex + 1; i < ancestor.children.length; i++) {
      siblings.push(ancestorChildren[i]);
    }
  }

  return siblings;
};
