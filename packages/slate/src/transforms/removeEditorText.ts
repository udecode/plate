import {
  type RemoveNodesOptions,
  type TEditor,
  type ValueOf,
  removeNodes,
} from '../interfaces';
import { getQueryOptions } from '../utils';

/** Remove non-empty editor text nodes */
export const removeEditorText = <E extends TEditor>(
  editor: E,
  options: RemoveNodesOptions<ValueOf<E>> = {}
) => {
  const match = getQueryOptions(editor, options).match;

  removeNodes(editor, {
    at: [],
    ...options,
    match: (n, p) => {
      return (n.text as string)?.length > 0 && (!match || match(n, p));
    },
  });
};
