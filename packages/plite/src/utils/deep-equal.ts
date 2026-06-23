import { isObject } from './is-object';

/*
  Custom deep equal comparison for Plite nodes.

  We don't need general purpose deep equality;
  Plite only supports plain values, Arrays, and nested objects.
  Complex values nested inside Arrays are not supported.

  Plite objects are designed to be serialised, so
  missing keys are deliberately normalised to undefined.
 */
export const isDeepEqual = (node: object, another: object): boolean => {
  if (Array.isArray(node) !== Array.isArray(another)) return false;

  const nodeRecord = node as Record<string, unknown>;
  const anotherRecord = another as Record<string, unknown>;

  for (const key in node) {
    if (!Object.hasOwn(node, key)) continue;
    const a = Object.hasOwn(node, key) ? nodeRecord[key] : undefined;
    const b = Object.hasOwn(another, key) ? anotherRecord[key] : undefined;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
    } else if (isObject(a) && isObject(b)) {
      if (!isDeepEqual(a as object, b as object)) return false;
    } else if (a !== b) {
      return false;
    }
  }

  /*
    Deep object equality is only necessary in one direction; in the reverse direction
    we are only looking for keys that are missing.
    As above, undefined keys are normalised to missing.
  */

  for (const key in another) {
    if (!Object.hasOwn(another, key)) continue;
    if (nodeRecord[key] === undefined && anotherRecord[key] !== undefined) {
      return false;
    }
  }

  return true;
};
