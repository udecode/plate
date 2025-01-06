import type { Path } from '../interfaces/path';

import {
  type Editor,
  type RemoveNodesOptions,
  type ValueOf,
  NodeApi,
} from '../interfaces';

/** Remove node children. */
export const removeNodeChildren = <E extends Editor>(
  editor: E,
  path: Path,
  options?: Omit<RemoveNodesOptions<ValueOf<E>>, 'at'>
) => {
  editor.tf.withoutNormalizing(() => {
    for (const [, childPath] of NodeApi.children(editor, path, {
      reverse: true,
    })) {
      editor.tf.removeNodes({ ...options, at: childPath });
    }
  });
};
