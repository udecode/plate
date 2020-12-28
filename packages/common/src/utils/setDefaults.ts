import defaultsDeep from 'lodash/defaultsDeep';
import { DeepRequired } from 'utility-types';

/**
 * Deep merge the default object properties that are not defined in the destination object.
 * @param object  The destination object.
 * @param defaultObject   The default object.
 */
export const setDefaults = <T, U>(
  object: T,
  defaultObject: U
): DeepRequired<T & U> => defaultsDeep(object, defaultObject);
