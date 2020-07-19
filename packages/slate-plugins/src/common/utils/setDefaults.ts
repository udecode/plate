import defaultsDeep from 'lodash/defaultsDeep';

/**
 * Deep merge the default object properties that are not defined in the destination object.
 * @param object  The destination object.
 * @param defaultObject   The default object.
 */
export const setDefaults = <T, U>(object: T, defaultObject: U): T & U =>
  defaultsDeep(object, defaultObject);
