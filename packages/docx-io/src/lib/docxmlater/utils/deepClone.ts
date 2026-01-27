/**
 * Deep clone utility for safely cloning objects
 * More efficient and type-safe than JSON.parse(JSON.stringify())
 */

/**
 * Deep clone an object using structured cloning
 * Preserves most object types including Date, RegExp, Map, Set, etc.
 *
 * For simple objects (like formatting options), this is more efficient
 * than JSON.parse(JSON.stringify()) and doesn't lose non-serializable values.
 *
 * @param obj - Object to clone
 * @returns Deep cloned copy of the object
 *
 * @example
 * ```typescript
 * const original = { bold: true, color: "FF0000", date: new Date() };
 * const cloned = deepClone(original);
 * cloned.bold = false;
 * console.log(original.bold); // true (unchanged)
 * console.log(cloned.date instanceof Date); // true (preserved)
 * ```
 */
export function deepClone<T>(obj: T): T {
  // Handle primitive types and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const arrCopy: any[] = [];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepClone(obj[i]);
    }
    return arrCopy as T;
  }

  // Handle Map
  if (obj instanceof Map) {
    const mapCopy = new Map();
    obj.forEach((value, key) => {
      mapCopy.set(deepClone(key), deepClone(value));
    });
    return mapCopy as T;
  }

  // Handle Set
  if (obj instanceof Set) {
    const setCopy = new Set();
    obj.forEach(value => {
      setCopy.add(deepClone(value));
    });
    return setCopy as T;
  }

  // Handle RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T;
  }

  // Handle plain objects
  const objCopy: any = Object.create(Object.getPrototypeOf(obj));
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      objCopy[key] = deepClone((obj as any)[key]);
    }
  }

  return objCopy as T;
}

/**
 * Shallow clone an object (one level deep)
 * More efficient when deep cloning is not needed
 *
 * @param obj - Object to clone
 * @returns Shallow cloned copy
 *
 * @example
 * ```typescript
 * const original = { bold: true, color: "FF0000" };
 * const cloned = shallowClone(original);
 * ```
 */
export function shallowClone<T extends object>(obj: T): T {
  if (Array.isArray(obj)) {
    return [...obj] as T;
  }
  return { ...obj };
}
