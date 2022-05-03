import { Path } from 'slate';
import { TAncestor } from '../../slate/types/TAncestor';
import { TDescendant } from '../../slate/types/TDescendant';
import { TNodeEntry } from '../../slate/types/TNodeEntry';

/**
 * Get the next sibling nodes after a path.
 * @param ancestorEntry Ancestor of the sibling nodes
 * @param path Path of the reference node
 */
export const getNextSiblingNodes = (
  ancestorEntry: TNodeEntry<TAncestor>,
  path: Path
) => {
  const [ancestor, ancestorPath] = ancestorEntry;

  const leafIndex = path[ancestorPath.length];

  const siblings: TDescendant[] = [];

  if (leafIndex + 1 < ancestor.children.length) {
    for (let i = leafIndex + 1; i < ancestor.children.length; i++) {
      siblings.push(ancestor.children[i]);
    }
  }

  return siblings;
};
