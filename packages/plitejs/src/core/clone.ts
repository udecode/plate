const OWNED_JSON_VALUES = new WeakSet<object>();
// JavaScriptCore takes O(length) to freeze an array and to Object.isFrozen a
// frozen one, so document root arrays stay unfrozen and membership here stands
// in for frozenness.
const IMMUTABLE_ARRAYS = new WeakSet<object>();

export const isOwnedJsonValue = (value: unknown): value is object =>
  value !== null && typeof value === 'object' && OWNED_JSON_VALUES.has(value);

/** @internal */
export const rememberImmutableArray = (value: readonly unknown[]) => {
  IMMUTABLE_ARRAYS.add(value);
};

export const isImmutable = (value: object) =>
  IMMUTABLE_ARRAYS.has(value) || Object.isFrozen(value);

export const ownJsonValue = (value: object) => {
  OWNED_JSON_VALUES.add(value);
};

/** Register a detached immutable value whose JSON reads are stable. */
export const freezeOwnedJsonValue = <T extends object>(value: T): T => {
  Object.freeze(value);
  OWNED_JSON_VALUES.add(value);

  return value;
};

// Primitives clone to themselves; skipping the host call matters because
// every projected read clones the (usually null) selection.
export const cloneValue = <T>(value: T): T =>
  value === null || typeof value !== 'object' ? value : structuredClone(value);

export const deepFreeze = <T>(value: T): T => {
  if (value == null || typeof value !== 'object' || isImmutable(value)) {
    return value;
  }

  Object.freeze(value);

  for (const key of Object.keys(value)) {
    deepFreeze((value as Record<string, unknown>)[key]);
  }

  return value;
};

export const cloneFrozen = <T>(value: T): T =>
  isOwnedJsonValue(value) ? value : deepFreeze(cloneValue(value));
