import { liftListItem as originalLiftListItem } from 'prosemirror-schema-list';
import { getNodeType } from '../helpers/getNodeType.js';

/**
 * Lift the list item around the selection up into a wrapping list.
 * @param typeOrName Type/name of the node.
 *
 * https://prosemirror.net/docs/ref/#schema-list.liftListItem
 */
export const liftListItem =
  (typeOrName) =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema);
    return originalLiftListItem(type)(state, dispatch);
  };
