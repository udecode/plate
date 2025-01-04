/* eslint-disable unicorn/prefer-array-some */
import type { FindNodeOptions, TEditor, ValueOf } from '../../interfaces/index';

/**
 * Iterate through all of the nodes in the editor and break early for the first
 * truthy match. Otherwise returns false.
 */
export const someNode = <E extends TEditor = TEditor>(
  editor: E,
  options: FindNodeOptions<ValueOf<E>>
) => {
  return !!editor.api.find(options);
};
