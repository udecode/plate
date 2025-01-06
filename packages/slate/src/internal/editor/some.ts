/* eslint-disable unicorn/prefer-array-some */
import type { Editor, ValueOf } from '../../interfaces/editor/editor';
import type { EditorFindOptions } from '../../interfaces/index';

/**
 * Iterate through all of the nodes in the editor and break early for the first
 * truthy match. Otherwise returns false.
 */
export const some = <E extends Editor>(
  editor: E,
  options: EditorFindOptions<ValueOf<E>>
) => {
  return !!editor.api.find(options);
};
