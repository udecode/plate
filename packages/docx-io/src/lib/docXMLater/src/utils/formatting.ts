/**
 * Formatting utilities for deep merging and cloning formatting objects
 * Used for style inheritance and applying formatting
 */

/**
 * Deep merges two formatting objects, with override taking precedence
 * Used for style inheritance and applying formatting
 *
 * @param base - Base formatting object
 * @param override - Override formatting object (takes precedence)
 * @returns Merged formatting object
 *
 * @example
 * ```typescript
 * const baseFormat = { bold: true, fontSize: 24 };
 * const overrideFormat = { fontSize: 28, italic: true };
 * const result = mergeFormatting(baseFormat, overrideFormat);
 * // Result: { bold: true, fontSize: 28, italic: true }
 * ```
 */
export function mergeFormatting<T extends Record<string, any>>(
  base: T,
  override: Partial<T>
): T {
  const result = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;

    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      // Deep merge nested objects
      result[key as keyof T] = mergeFormatting(
        result[key as keyof T] || ({} as any),
        value
      ) as any;
    } else {
      // Direct assignment for primitives
      result[key as keyof T] = value as any;
    }
  }

  return result;
}

/**
 * Deep clones a formatting object
 * Creates a completely independent copy with no shared references
 *
 * @param formatting - Formatting object to clone
 * @returns Cloned formatting object
 *
 * @example
 * ```typescript
 * const original = { bold: true, indentation: { left: 100 } };
 * const cloned = cloneFormatting(original);
 * cloned.indentation.left = 200; // Doesn't affect original
 * ```
 */
export function cloneFormatting<T>(formatting: T): T {
  return JSON.parse(JSON.stringify(formatting));
}

/**
 * Checks if a formatting object has any defined properties
 *
 * @param formatting - Formatting object to check
 * @returns True if the object has at least one defined property
 *
 * @example
 * ```typescript
 * hasFormatting({}) // false
 * hasFormatting({ bold: true }) // true
 * hasFormatting({ bold: undefined }) // false
 * ```
 */
export function hasFormatting(formatting: Record<string, any>): boolean {
  for (const value of Object.values(formatting)) {
    if (value !== undefined && value !== null) {
      return true;
    }
  }
  return false;
}

/**
 * Removes undefined and null properties from a formatting object
 * Useful for cleaning up formatting before comparison or serialization
 *
 * @param formatting - Formatting object to clean
 * @returns Cleaned formatting object with no undefined/null values
 *
 * @example
 * ```typescript
 * const dirty = { bold: true, italic: undefined, fontSize: null, underline: false };
 * const clean = cleanFormatting(dirty);
 * // Result: { bold: true, underline: false }
 * ```
 */
export function cleanFormatting<T extends Record<string, any>>(
  formatting: T
): Partial<T> {
  const cleaned: Partial<T> = {};

  for (const [key, value] of Object.entries(formatting)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively clean nested objects
        const cleanedNested = cleanFormatting(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key as keyof T] = cleanedNested as any;
        }
      } else {
        cleaned[key as keyof T] = value;
      }
    }
  }

  return cleaned;
}

/**
 * Compares two formatting objects for equality
 * Performs deep comparison of all properties
 *
 * @param format1 - First formatting object
 * @param format2 - Second formatting object
 * @returns True if the formatting objects are equal
 *
 * @example
 * ```typescript
 * const a = { bold: true, fontSize: 24 };
 * const b = { bold: true, fontSize: 24 };
 * const c = { bold: true, fontSize: 28 };
 * isEqualFormatting(a, b) // true
 * isEqualFormatting(a, c) // false
 * ```
 */
export function isEqualFormatting(
  format1: Record<string, any>,
  format2: Record<string, any>
): boolean {
  // Quick reference check
  if (format1 === format2) return true;

  // Null/undefined checks
  if (!format1 || !format2) return false;

  // Get all keys from both objects
  const keys1 = Object.keys(format1);
  const keys2 = Object.keys(format2);

  // Check if they have the same number of properties
  if (keys1.length !== keys2.length) return false;

  // Check all properties
  for (const key of keys1) {
    const val1 = format1[key];
    const val2 = format2[key];

    // Both undefined/null - considered equal
    if (
      (val1 === undefined || val1 === null) &&
      (val2 === undefined || val2 === null)
    ) {
      continue;
    }

    // One is undefined/null and the other isn't
    if (
      (val1 === undefined || val1 === null) !==
      (val2 === undefined || val2 === null)
    ) {
      return false;
    }

    // Check nested objects
    if (
      typeof val1 === 'object' &&
      typeof val2 === 'object' &&
      !Array.isArray(val1) &&
      !Array.isArray(val2)
    ) {
      if (!isEqualFormatting(val1, val2)) return false;
    } else if (val1 !== val2) {
      return false;
    }
  }

  return true;
}

/**
 * Applies default values to a formatting object for any undefined properties
 *
 * @param formatting - Formatting object to apply defaults to
 * @param defaults - Default values
 * @returns Formatting object with defaults applied
 *
 * @example
 * ```typescript
 * const format = { bold: true };
 * const defaults = { bold: false, italic: false, fontSize: 24 };
 * const result = applyDefaults(format, defaults);
 * // Result: { bold: true, italic: false, fontSize: 24 }
 * ```
 */
export function applyDefaults<T extends Record<string, any>>(
  formatting: Partial<T>,
  defaults: T
): T {
  const result = { ...defaults };

  for (const [key, value] of Object.entries(formatting)) {
    if (value !== undefined) {
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null &&
        typeof defaults[key] === 'object'
      ) {
        // Deep merge nested objects
        result[key as keyof T] = applyDefaults(value, defaults[key]) as any;
      } else {
        result[key as keyof T] = value;
      }
    }
  }

  return result;
}
