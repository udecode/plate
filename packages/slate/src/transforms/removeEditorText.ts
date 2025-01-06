import {
  type Editor,
  type RemoveNodesOptions,
  type ValueOf,
  TextApi,
} from '../interfaces';
import { getQueryOptions } from '../utils';

/** Remove non-empty editor text nodes */
export const removeEditorText = <E extends Editor>(
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
