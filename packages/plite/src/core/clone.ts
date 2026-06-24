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

export const cloneFrozen = <T>(value: T): T => deepFreeze(cloneValue(value));
