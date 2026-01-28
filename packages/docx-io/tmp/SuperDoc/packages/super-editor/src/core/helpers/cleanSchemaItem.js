import { isEmptyObject } from '../utilities/isEmptyObject.js';

/**
 * Clean schema item from "null" and "undefined" values.
 * @param schemaItem Schema item.
 * @returns Cleaned schema item.
 */
export function cleanSchemaItem(schemaItem) {
  const entries = Object.entries(schemaItem).filter(([key, value]) => {
    if (key === 'attrs' && isEmptyObject(value)) {
      return false;
    }
    return value !== null && value !== undefined;
  });
  return Object.fromEntries(entries);
}
