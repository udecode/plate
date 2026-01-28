import { getNodeType } from '../helpers/getNodeType.js';
import { isNodeActive } from '../helpers/isNodeActive.js';

/**
 * Toggle a node with another node.
 * @param typeOrName The type or name of the node.
 * @param toggleTypeOrName The type or name of the node to toggle.
 * @param attrs The attrs of the node.
 */
export const toggleNode =
  (typeOrName, toggleTypeOrName, attrs = {}) =>
  ({ state, commands }) => {
    const type = getNodeType(typeOrName, state.schema);
    const toggleType = getNodeType(toggleTypeOrName, state.schema);
    const isActive = isNodeActive(state, type, attrs);
    if (isActive) return commands.setNode(toggleType);
    return commands.setNode(type, attrs);
  };
