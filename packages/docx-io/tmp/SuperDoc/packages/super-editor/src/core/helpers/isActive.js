import { getSchemaTypeNameByName } from './getSchemaTypeNameByName.js';
import { isMarkActive } from './isMarkActive.js';
import { isNodeActive } from './isNodeActive.js';

/**
 * Checks if the currently selected node or mark is active.
 * @param state The current editor state.
 * @param name The name of the node or mark (or null).
 * @param attrs The node or mark attrs.
 * @returns Boolean.
 */
export function isActive(state, name, attrs = {}) {
  if (!name) {
    return isNodeActive(state, null, attrs) || isMarkActive(state, null, attrs);
  }

  const schemaType = getSchemaTypeNameByName(name, state.schema);

  if (schemaType === 'node') {
    return isNodeActive(state, name, attrs);
  }
  if (schemaType === 'mark') {
    return isMarkActive(state, name, attrs);
  }

  return false;
}
