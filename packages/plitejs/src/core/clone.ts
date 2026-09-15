const OWNED_JSON_VALUES = new WeakSet<object>();

export const isOwnedJsonValue = (value: unknown): value is object =>
  value !== null && typeof value === 'object' && OWNED_JSON_VALUES.has(value);

/** Register a detached immutable value whose JSON reads are stable. */
export const freezeOwnedJsonValue = <T extends object>(value: T): T => {
  Object.freeze(value);
  OWNED_JSON_VALUES.add(value);

  return value;
};

export const cloneValue = <T>(value: T): T => structuredClone(value);

export const deepFreeze = <T>(value: T): T => {
  if (value == null || typeof value !== 'object' || Object.isFrozen(value)) {
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
