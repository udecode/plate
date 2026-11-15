import { countCoreWork } from './work';

const MAX_VALUES = 100;
const MAX_DEPTH = 64;

let valuesLeft = 0;

const isEnumerable = (value: object, key: PropertyKey) =>
  Object.prototype.propertyIsEnumerable.call(value, key);

const isDataDescriptor = (
  descriptor: PropertyDescriptor | undefined
): descriptor is PropertyDescriptor =>
  descriptor !== undefined &&
  descriptor.get === undefined &&
  descriptor.set === undefined;

const ownsOnlyKeys = (value: object, count: number) =>
  Reflect.ownKeys(value).length === count;

const marksReactElement = (key: string) => key === '$$typeof';

const marksDocumentNode = (key: string, value: unknown) =>
  (key === 'text' && typeof value === 'string') ||
  (key === 'children' && Array.isArray(value));

const arePlainLists = (
  previous: readonly unknown[],
  next: readonly unknown[],
  length: number
) => {
  const entriesAndLength = length + 1;

  if (
    !ownsOnlyKeys(previous, entriesAndLength) ||
    !ownsOnlyKeys(next, entriesAndLength)
  ) {
    return false;
  }

  for (let index = 0; index < length; index++) {
    if (!isEnumerable(next, index)) return false;
  }

  return true;
};

const sameList = (
  previous: readonly unknown[],
  next: unknown,
  depth: number
): boolean => {
  const { length } = previous;

  if (!Array.isArray(next) || length !== next.length) return false;
  valuesLeft -= length;
  if (valuesLeft < 0) return false;
  if (
    Object.getPrototypeOf(previous) !== Array.prototype ||
    Object.getPrototypeOf(next) !== Array.prototype
  ) {
    return false;
  }

  for (let index = 0; index < length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(previous, index);

    if (!isDataDescriptor(descriptor) || !descriptor.enumerable) return false;

    const a: unknown = descriptor.value;
    const b = next[index];

    if (!Object.is(a, b) && !sameAt(a, b, depth + 1)) return false;
  }

  return arePlainLists(previous, next, length);
};

const sameAt = (previous: unknown, next: unknown, depth: number): boolean => {
  if (
    typeof previous !== 'object' ||
    typeof next !== 'object' ||
    previous === null ||
    next === null ||
    depth > MAX_DEPTH
  ) {
    return false;
  }
  if (Array.isArray(previous)) return sameList(previous, next, depth);
  if (Array.isArray(next)) return false;

  const prototype = Object.getPrototypeOf(previous);

  if (
    (prototype !== Object.prototype && prototype !== null) ||
    Object.getPrototypeOf(next) !== prototype
  ) {
    return false;
  }

  const keys = Object.keys(previous);

  valuesLeft -= keys.length;
  if (valuesLeft < 0) return false;

  const nextFrozen = Object.isFrozen(next);
  const frozen = nextFrozen || Object.isFrozen(previous);
  let nested: unknown[] | undefined;

  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(previous, key);

    if (!isDataDescriptor(descriptor)) return false;

    const a: unknown = descriptor.value;

    if (marksReactElement(key) || (frozen && marksDocumentNode(key, a))) {
      return false;
    }

    let b: unknown;

    if (nextFrozen) {
      const nextDescriptor = Object.getOwnPropertyDescriptor(next, key);

      if (!isDataDescriptor(nextDescriptor) || !nextDescriptor.enumerable) {
        return false;
      }

      b = nextDescriptor.value;
    } else {
      if (!isEnumerable(next, key)) return false;

      b = (next as Record<string, unknown>)[key];
    }

    if (Object.is(a, b)) continue;
    if (
      typeof a !== 'object' ||
      typeof b !== 'object' ||
      a === null ||
      b === null
    ) {
      return false;
    }

    nested ??= [];
    nested.push(a, b);
  }

  if (nested !== undefined) {
    for (let index = 0; index < nested.length; index += 2) {
      if (!sameAt(nested[index], nested[index + 1], depth + 1)) return false;
    }
  }

  return ownsOnlyKeys(previous, keys.length) && ownsOnlyKeys(next, keys.length);
};

/**
 * Whether a selector's new result is the same as its earlier one, so the hook
 * keeps the earlier result and skips the render.
 *
 * Lists and plain objects compare by their contents, with `Object.is` at every
 * depth. A document node, a React element and any other object compare by
 * identity. Every doubt answers "different", because that costs one render: a
 * getter on the earlier result, a symbol or hidden key, a list that is not a
 * plain list, a read that throws, and a result past 100 values or 64 levels.
 * No getter of the earlier result runs, and no getter field of a frozen new
 * plain object.
 *
 * @internal
 */
export const sameResult = <T>(previous: T | null, next: T): boolean => {
  if (Object.is(previous, next)) return true;

  const outer = valuesLeft;

  valuesLeft = MAX_VALUES;

  try {
    return sameAt(previous, next, 0);
  } catch {
    return false;
  } finally {
    countCoreWork('selectorResultValues', MAX_VALUES - valuesLeft);
    valuesLeft = outer;
  }
};
