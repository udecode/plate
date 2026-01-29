import { isRegExp } from './isRegExp.js';

/**
 * Check if obj1 includes obj2
 * @param obj1 Object
 * @param obj2 Object
 */
export function objectIncludes(obj1, obj2, options = { strict: true }) {
  const keys = Object.keys(obj2);
  if (!keys.length) return true;
  return keys.every((key) => {
    if (options.strict) return obj2[key] === obj1[key];
    if (isRegExp(obj2[key])) return obj2[key].test(obj1[key]);
    return obj2[key] === obj1[key];
  });
}
