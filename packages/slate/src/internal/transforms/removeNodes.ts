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
    // Handle previousEmptyBlock option
    if (previousEmptyBlock && options.at) {
      const entry = editor.api.block({ at: options.at });

      if (entry) {
        const prevEntry = editor.api.previous({
          at: entry[1],
          sibling: true,
        });

        if (prevEntry && editor.api.isEmpty(prevEntry[0])) {
          editor.tf.removeNodes({ at: prevEntry[1] });
        }
      }
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
