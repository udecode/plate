/* eslint-disable unicorn/prefer-array-some */
import type {
  Editor,
  EditorFindOptions,
  ValueOf,
} from '../../interfaces/index';

/**
 * Iterate through all of the nodes in the editor and break early for the first
 * truthy match. Otherwise returns false.
 */
export const someNode = <E extends Editor = Editor>(
  editor: E,
  options: EditorFindOptions<ValueOf<E>>
) => {
  return !!editor.api.find(options);
};
