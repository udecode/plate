import { NodeEntry, Path } from 'slate';
import {TAncestor} from "../../types/slate/TAncestor";
import {TDescendant} from "../../types/slate/TDescendant";
  
/**
 * Get the next sibling nodes after a path.
 * @param ancestorEntry Ancestor of the sibling nodes
 * @param path Path of the reference node
 */
export const getNextSiblingNodes = (
  ancestorEntry: NodeEntry<TAncestor>,
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
