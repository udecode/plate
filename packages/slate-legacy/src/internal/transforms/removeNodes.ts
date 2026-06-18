import { removeNodes as removeNodesBase } from 'slate';

import type { Editor, RemoveNodesOptions, ValueOf } from '../../interfaces';

import { NodeApi } from '../../interfaces';
import { getQueryOptions } from '../../utils';

export const removeNodes = <E extends Editor>(
  editor: E,
  { children, previousEmptyBlock, ...opt }: RemoveNodesOptions<ValueOf<E>> = {}
) => {
  const options = getQueryOptions(editor, opt);

  editor.tf.withoutNormalizing(() => {
    if (previousEmptyBlock) {
      const entry = editor.api.block({ at: options.at });

      if (!entry) return;

      const prevEntry = editor.api.previous({
        at: entry[1],
        sibling: true,
      });

      if (!prevEntry) return;

      const [prevNode, prevPath] = prevEntry;

      if (editor.api.isEmpty(prevNode)) {
        editor.tf.removeNodes({ at: prevPath });
      }

      return;
    }
    // Handle children option
    if (children && options.at) {
      for (const [, childPath] of NodeApi.children(editor, options.at, {
        reverse: true,
      })) {
        editor.tf.removeNodes({ ...options, at: childPath });
      }

      return;
    }

    return removeNodesBase(editor as any, getQueryOptions(editor, options));
  });
};
