import { Path } from 'slate';
import { Value } from '../../slate/types/TEditor';
import { EAncestorEntry, EDescendantEntry } from '../../slate/types/TNodeEntry';

/**
 * Get the next sibling nodes after a path.
 * @param ancestorEntry Ancestor of the sibling nodes
 * @param path Path of the reference node
 */
export const getNextSiblingNodes = <V extends Value>(
  ancestorEntry: EAncestorEntry<V>,
  path: Path
) => {
  const [ancestor, ancestorPath] = ancestorEntry;

  const leafIndex = path[ancestorPath.length];

  const siblings: EDescendantEntry<V>[] = [];

  if (leafIndex + 1 < ancestor.children.length) {
    for (let i = leafIndex + 1; i < ancestor.children.length; i++) {
      siblings.push((ancestor.children[i] as any) as EDescendantEntry<V>);
    }
  }

  return siblings;
};
