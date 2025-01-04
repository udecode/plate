/* eslint-disable unicorn/prefer-array-some */
import type { TEditor, ValueOf } from '../../interfaces/editor/TEditor';
import type { FindNodeOptions } from '../../interfaces/editor/editor-types';

/**
 * Iterate through all of the nodes in the editor and break early for the first
 * truthy match. Otherwise returns false.
 */
export const some = <E extends TEditor>(
  editor: E,
  options: FindNodeOptions<ValueOf<E>>
) => {
  return !!editor.api.find(options);
};
