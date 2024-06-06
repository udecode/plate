import type { Path } from 'slate';

import {
  type RemoveNodesOptions,
  type TEditor,
  type Value,
  getNodeChildren,
  removeNodes,
  withoutNormalizing,
} from '@udecode/slate';

/** Remove node children. */
export const removeNodeChildren = <V extends Value = Value>(
  editor: TEditor<V>,
  path: Path,
  options?: Omit<RemoveNodesOptions<V>, 'at'>
) => {
  withoutNormalizing(editor, () => {
    for (const [, childPath] of getNodeChildren(editor, path, {
      reverse: true,
    })) {
      removeNodes(editor, { ...options, at: childPath });
    }
  });
};
