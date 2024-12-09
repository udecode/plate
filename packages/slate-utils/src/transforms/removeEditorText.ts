import {
  type RemoveNodesOptions,
  type TEditor,
  removeNodes,
} from '@udecode/slate';

/** Remove non-empty editor text nodes */
export const removeEditorText = <E extends TEditor>(
  editor: E,
  { match, ...options }: RemoveNodesOptions<E> = {}
) => {
  removeNodes(editor, {
    at: [],
    match: (n, p) => {
      return (n.text as string)?.length > 0 && (!match || match(n, p));
    },
    ...options,
  });
};
