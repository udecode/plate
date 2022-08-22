import { Path } from 'slate';
import { Value } from '../slate/editor/TEditor';
import { EElementOrText } from '../slate/element/TElement';
import { EAncestorEntry } from '../slate/node/TNodeEntry';

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
