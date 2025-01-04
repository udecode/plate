import type { RemoveNodesOptions } from '../interfaces/editor/editor-types';

import { type TEditor, type ValueOf, TextApi } from '../interfaces';
import { getQueryOptions } from '../utils';

/** Remove non-empty editor text nodes */
export const removeEditorText = <E extends TEditor>(
  editor: E,
  options: RemoveNodesOptions<ValueOf<E>> = {}
) => {
  const match = getQueryOptions(editor, options).match;

  editor.tf.removeNodes({
    at: [],
    ...options,
    match: (n, p) => {
      return (
        TextApi.isText(n) &&
        (n.text as string)?.length > 0 &&
        (!match || match(n, p))
      );
    },
  });
};
