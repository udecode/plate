import type { Path } from 'slate';

import {
  type RemoveNodesOptions,
  type TEditor,
  type ValueOf,
  getNodeChildren,
  removeNodes,
  withoutNormalizing,
} from '../interfaces';

/** Remove node children. */
export const removeNodeChildren = <E extends TEditor>(
  editor: E,
  path: Path,
  options?: Omit<RemoveNodesOptions<ValueOf<E>>, 'at'>
) => {
  withoutNormalizing(editor, () => {
    for (const [, childPath] of getNodeChildren(editor, path, {
      reverse: true,
    })) {
      removeNodes(editor, { ...options, at: childPath });
    }
  });
};
