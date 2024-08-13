import type { Path } from 'slate';

import {
  type RemoveNodesOptions,
  type TEditor,
  getNodeChildren,
  removeNodes,
  withoutNormalizing,
} from '@udecode/slate';

/** Remove node children. */
export const removeNodeChildren = <E extends TEditor>(
  editor: E,
  path: Path,
  options?: Omit<RemoveNodesOptions<E>, 'at'>
) => {
  withoutNormalizing(editor, () => {
    for (const [, childPath] of getNodeChildren(editor, path, {
      reverse: true,
    })) {
      removeNodes(editor, { ...options, at: childPath });
    }
  });
};
