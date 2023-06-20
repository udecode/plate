import { Path } from 'slate';
import { isText } from '../text';
import { NodeOf, TNode } from './TNode';

/**
 * Get the descendant node referred to by a specific path.
 * If the path is an empty array, it refers to the root node itself.
 * If the node is not found, return null.
 * Based on Slate get and has, performance optimization without overhead of
 * stringify on throwing
 */
export const getNode = <N extends NodeOf<R>, R extends TNode = TNode>(
  root: R,
  path: Path
) => {
  try {
    for (let i = 0; i < path.length; i++) {
      const p = path[i];

      if (isText(root) || !root.children[p]) {
        return null;
      }

      root = root.children[p] as R;
    }

    return root as N;
  } catch (error) {
    return null;
  }
};
