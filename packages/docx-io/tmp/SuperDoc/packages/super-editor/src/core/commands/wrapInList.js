import { wrapInList as originalWrapInList } from 'prosemirror-schema-list';
import { getNodeType } from '../helpers/getNodeType.js';

/**
 * Wrap a node in a list.
 * @param typeOrName Type/name of the node.
 * @param attrs Attributes of the node.
 *
 * https://prosemirror.net/docs/ref/#schema-list.wrapInList
 */
//prettier-ignore
export const wrapInList = (typeOrName, attrs = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  return originalWrapInList(type, attrs)(state, dispatch);
};
