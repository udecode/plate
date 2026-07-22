const PROPERTY_POLICY: unique symbol = Symbol('PropertyPolicy');
const propertyPolicies = new WeakSet<object>();

/**
 * A named validation law. Schema fingerprints use only `id` and `version`;
 * function identity is never part of persisted schema identity. Change
 * `version` whenever validation behavior changes.
 */
export type PropertyPolicy<TValue = unknown> = Readonly<{
  [PROPERTY_POLICY]: true;
  id: string;
  validate: (value: unknown) => value is TValue;
  version: number;
}>;

export type PropertyPolicyInput<TValue> = Readonly<{
  id: string;
  /** Narrow an untrusted JSON value to the declared property type. */
  validate: (value: unknown) => value is TValue;
  version: number;
}>;

/** @internal Runtime trust boundary for property policy tokens. */
export const isPropertyPolicyToken = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && propertyPolicies.has(value);

/** Define one stable custom validator for a JSON property value type. */
export const definePropertyPolicy = <TValue>(
  input: PropertyPolicyInput<TValue>
): PropertyPolicy<TValue> => {
  for (const key of Reflect.ownKeys(input)) {
    if (
      typeof key !== 'string' ||
      !['id', 'validate', 'version'].includes(key)
    ) {
      throw new Error(`Property policy does not support key "${String(key)}".`);
    }
  }
  if (input.id.length === 0) {
    throw new Error('Property policy id cannot be empty.');
  }
  if (!Number.isInteger(input.version) || input.version < 1) {
    throw new Error(
      `Property policy "${input.id}" version must be a positive integer.`
    );
  }
  if (typeof input.validate !== 'function') {
    throw new Error(
      `Property policy "${input.id}" validate must be a function.`
    );
  }

  const policy: PropertyPolicy<TValue> = {
    [PROPERTY_POLICY]: true,
    id: input.id,
    validate: input.validate,
    version: input.version,
  };

  Object.defineProperties(policy, {
    [PROPERTY_POLICY]: { enumerable: false, value: true },
    validate: { enumerable: false, value: input.validate },
  });
  const frozen = Object.freeze(policy);

  propertyPolicies.add(frozen);

  return frozen;
};
