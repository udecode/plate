import type { UnknownObject } from '@udecode/plate';

import baseIsEqual from 'lodash/isEqual.js';
import isPlainObject from 'lodash/isPlainObject.js';

export interface IsEqualOptions {
  // Ignore props on all descendant objects
  ignoreDeep?: string[];

  // Ignore props only on top-level objects
  ignoreShallow?: string[];
}

const without = (
  x: unknown,
  { ignoreDeep = [], ignoreShallow = [] }: IsEqualOptions = {}
): unknown => {
  if (Array.isArray(x))
    return x.map((y) => without(y, { ignoreDeep, ignoreShallow }));

  if (!isPlainObject(x)) return x;
  const obj = x as UnknownObject;

  const result: UnknownObject = {};

  for (const [key, value] of Object.entries(obj)) {
    if (ignoreShallow.includes(key) || ignoreDeep.includes(key)) continue;
    result[key] = without(value, { ignoreDeep });
  }

  return result;
};

export const isEqual = (
  value: unknown,
  other: unknown,
  options?: IsEqualOptions
) => baseIsEqual(without(value, options), without(other, options));
