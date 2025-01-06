import type { Path } from 'slate';

import type { RemoveNodesOptions } from '../interfaces/editor/editor-types';

import { type Editor, type ValueOf, getNodeChildren } from '../interfaces';

/** Remove node children. */
export const removeNodeChildren = <E extends Editor>(
  editor: E,
  path: Path,
  options?: Omit<RemoveNodesOptions<ValueOf<E>>, 'at'>
) => {
  editor.tf.withoutNormalizing(() => {
    for (const [, childPath] of getNodeChildren(editor, path, {
      reverse: true,
    })) {
      editor.tf.removeNodes({ ...options, at: childPath });
    }
  });
};
