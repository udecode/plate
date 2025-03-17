import type {
  Editor,
  EditorNodesOptions,
  ValueOf,
} from '../../interfaces/index';

/**
 * Iterate through all of the nodes in the editor and break early for the first
 * truthy match. Otherwise returns false.
 */
export const some = <E extends Editor = Editor>(
  editor: E,
  options: EditorNodesOptions<ValueOf<E>>
) => {
  return !!editor.api.node(options);
};
