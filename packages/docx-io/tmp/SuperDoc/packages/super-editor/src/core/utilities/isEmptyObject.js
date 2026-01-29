/**
 * Check if the object is empty.
 * @param value Object.
 */
export function isEmptyObject(value = {}) {
  return Object.keys(value).length === 0 && value.constructor === Object;
}
