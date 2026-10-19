import { isImmutable } from '../clone';

export type JsonRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const jsonEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;

  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonEqual(value, right[index]))
    );
  }

  if (!isRecord(left) || !isRecord(right)) return false;

  const keys = Object.keys(left);

  return (
    keys.length === Object.keys(right).length &&
    keys.every(
      (key) => Object.hasOwn(right, key) && jsonEqual(left[key], right[key])
    )
  );
};

export const cloneJson = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => cloneJson(item)) as T;
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneJson(item)])
    ) as T;
  }

  return value;
};

const DEEP_IMMUTABLE_VALUES = new WeakSet<object>();

export const deepFreeze = <T>(value: T): T => {
  if (
    typeof value !== 'object' ||
    value === null ||
    DEEP_IMMUTABLE_VALUES.has(value)
  ) {
    return value;
  }

  for (const item of Array.isArray(value) ? value : Object.values(value)) {
    deepFreeze(item);
  }
  if (!isImmutable(value)) Object.freeze(value);
  DEEP_IMMUTABLE_VALUES.add(value);

  return value;
};

export const cloneFrozen = <T>(value: T): T => deepFreeze(cloneJson(value));
