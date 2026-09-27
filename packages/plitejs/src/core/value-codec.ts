import type {
  EditorEffect,
  EditorEffectType,
  EditorValuePersistence,
  SerializedEditorEffect,
  SerializedEditorValue,
} from '../interfaces/editor';
import type { EditorJsonValue } from '../interfaces/json';
import { freezeOwnedJsonValue, isOwnedJsonValue } from './clone';
import { createEditorEffect } from './transaction-values';

const getFunctionSource = (value: object) =>
  Function.prototype.toString.call(value);
const arrayConstructorSource = getFunctionSource(Array);
const objectConstructorSource = getFunctionSource(Object);

const hasIntrinsicConstructor = (
  prototype: object,
  constructorSource: string
) => {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'constructor');

  return (
    Object.hasOwn(descriptor ?? {}, 'value') &&
    typeof descriptor?.value === 'function' &&
    getFunctionSource(descriptor.value) === constructorSource
  );
};

const isObjectPrototype = (prototype: object | null) =>
  prototype === null ||
  (Object.getPrototypeOf(prototype) === null &&
    hasIntrinsicConstructor(prototype, objectConstructorSource));

const isArrayPrototype = (prototype: object | null) =>
  prototype !== null &&
  hasIntrinsicConstructor(prototype, arrayConstructorSource) &&
  isObjectPrototype(Object.getPrototypeOf(prototype));

/**
 * Read one strict JSON array without traversing its values.
 *
 * @internal
 */
export const getEditorJsonArrayItems = (
  value: unknown
): readonly unknown[] | null => {
  if (
    !Array.isArray(value) ||
    !isArrayPrototype(Object.getPrototypeOf(value))
  ) {
    return null;
  }

  const keys = Reflect.ownKeys(value);

  if (keys.length !== value.length + 1 || !keys.includes('length')) return null;

  const items: unknown[] = [];

  for (let index = 0; index < value.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));

    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) {
      return null;
    }

    items.push(descriptor.value);
  }

  return items;
};

/**
 * Read one strict JSON record without traversing its values.
 *
 * @internal
 */
export const getEditorJsonRecordEntries = (
  value: unknown
): ReadonlyArray<readonly [string, unknown]> | null => {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !isObjectPrototype(Object.getPrototypeOf(value))
  ) {
    return null;
  }

  const entries: Array<readonly [string, unknown]> = [];

  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string') return null;

    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) {
      return null;
    }

    entries.push([key, descriptor.value]);
  }

  return entries;
};

export const isEditorJsonValue = (
  value: unknown,
  seen = new WeakSet<object>()
): boolean => {
  if (value === null) return true;

  switch (typeof value) {
    case 'boolean':
    case 'string': {
      return true;
    }
    case 'number': {
      return Number.isFinite(value) && !Object.is(value, -0);
    }
    case 'object': {
      if (isOwnedJsonValue(value)) {
        return true;
      }
      if (seen.has(value)) return false;
      seen.add(value);

      try {
        if (Array.isArray(value)) {
          const items = getEditorJsonArrayItems(value);

          return (
            items !== null &&
            items.every((item) => isEditorJsonValue(item, seen))
          );
        }

        const entries = getEditorJsonRecordEntries(value);

        return (
          entries !== null &&
          entries.every(([, item]) => isEditorJsonValue(item, seen))
        );
      } finally {
        seen.delete(value);
      }
    }
    default: {
      return false;
    }
  }
};

const hasComparedPair = (
  compared: WeakMap<object, WeakSet<object>>,
  left: object,
  right: object
) => {
  const rights = compared.get(left);

  if (rights?.has(right)) return true;

  if (rights) {
    rights.add(right);
  } else {
    compared.set(left, new WeakSet([right]));
  }

  return false;
};

const areJsonValuesStructurallyEqual = (
  left: unknown,
  right: unknown,
  compared = new WeakMap<object, WeakSet<object>>()
): boolean => {
  if (Object.is(left, right)) return true;
  if (
    left === null ||
    right === null ||
    typeof left !== typeof right ||
    typeof left !== 'object' ||
    typeof right !== 'object' ||
    Array.isArray(left) !== Array.isArray(right)
  ) {
    return false;
  }
  if (hasComparedPair(compared, left, right)) return true;

  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) =>
        areJsonValuesStructurallyEqual(item, right[index], compared)
      )
    );
  }

  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord);

  return (
    leftKeys.length === Object.keys(rightRecord).length &&
    leftKeys.every(
      (key) =>
        Object.hasOwn(rightRecord, key) &&
        areJsonValuesStructurallyEqual(
          leftRecord[key],
          rightRecord[key],
          compared
        )
    )
  );
};

export const areEditorJsonValuesEqual = (
  left: unknown,
  right: unknown
): boolean => {
  if (Object.is(left, right)) return true;
  if (!isEditorJsonValue(left) || !isEditorJsonValue(right)) return false;

  return areJsonValuesStructurallyEqual(left, right);
};

export const cloneEditorJsonValue = <T>(value: T): T => {
  if (Array.isArray(value)) {
    const cloned = new Array<unknown>(value.length);

    for (let index = 0; index < value.length; index++) {
      cloned[index] = cloneEditorJsonValue(value[index]);
    }

    return cloned as T;
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        cloneEditorJsonValue(item),
      ])
    ) as T;
  }

  return value;
};

/**
 * Validate, detach, and freeze JSON-compatible data in one pass.
 *
 * @internal
 */
export const snapshotEditorJsonValue = <T>(value: T, label: string): T => {
  const invalid = (): never => {
    throw new Error(`${label} must encode to JSON-compatible data.`);
  };
  const clone = (input: unknown, seen: WeakSet<object>): unknown => {
    if (input === null) return null;

    switch (typeof input) {
      case 'boolean':
      case 'string': {
        return input;
      }
      case 'number': {
        if (!Number.isFinite(input) || Object.is(input, -0)) invalid();

        return input;
      }
      case 'object': {
        if (isOwnedJsonValue(input)) return input;
        if (seen.has(input)) invalid();
        seen.add(input);

        try {
          if (Array.isArray(input)) {
            const items = getEditorJsonArrayItems(input) ?? invalid();

            return freezeOwnedJsonValue(items.map((item) => clone(item, seen)));
          }

          const entries = getEditorJsonRecordEntries(input) ?? invalid();

          return freezeOwnedJsonValue(
            Object.fromEntries(
              entries.map(([key, item]) => [key, clone(item, seen)])
            )
          );
        } finally {
          seen.delete(input);
        }
      }
      default: {
        return invalid();
      }
    }
  };

  return clone(value, new WeakSet()) as T;
};

export const cloneFrozenEditorJsonValue = <T>(value: T): T =>
  snapshotEditorJsonValue(value, 'Editor value');

const assertPersistenceVersion = (version: number) => {
  if (!Number.isSafeInteger(version) || version < 1) {
    throw new Error(
      'Editor value persistence version must be a positive integer.'
    );
  }
};

const assertJsonValue = (value: unknown, label: string) => {
  if (!isEditorJsonValue(value)) {
    throw new Error(`${label} must encode to JSON-compatible data.`);
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const PERSISTENCE_OWNED_CURRENT_INPUTS = new WeakSet<object>();

/**
 * Mark persistence whose current-version decoder validates and detaches its
 * own input before returning an owned editor JSON value.
 *
 * @internal
 */
export const ownCurrentEditorValuePersistenceInput = <
  TValue,
  TEncoded extends EditorJsonValue,
>(
  persistence: EditorValuePersistence<TValue, TEncoded>
): EditorValuePersistence<TValue, TEncoded> => {
  PERSISTENCE_OWNED_CURRENT_INPUTS.add(persistence);

  return persistence;
};

/** @internal */
export const normalizeEditorValuePersistence = <
  TValue,
  TEncoded extends EditorJsonValue = EditorJsonValue,
>(
  persistence: EditorValuePersistence<TValue, TEncoded>
): EditorValuePersistence<TValue, TEncoded> => {
  if (
    !persistence ||
    typeof persistence !== 'object' ||
    typeof persistence.decode !== 'function' ||
    typeof persistence.encode !== 'function'
  ) {
    throw new Error(
      'Editor value persistence requires decode and encode functions.'
    );
  }
  assertPersistenceVersion(persistence.version);

  const legacyDecoders = persistence.legacyDecoders
    ? Object.freeze({ ...persistence.legacyDecoders })
    : undefined;
  for (const [savedVersion, decode] of Object.entries(legacyDecoders ?? {})) {
    const version = Number(savedVersion);
    if (
      !Number.isSafeInteger(version) ||
      version < 1 ||
      version >= persistence.version ||
      typeof decode !== 'function'
    ) {
      throw new Error(
        'Editor value persistence legacy versions must be positive integers below the current version.'
      );
    }
  }

  const defined = Object.freeze({
    decode: persistence.decode,
    encode: persistence.encode,
    ...(legacyDecoders ? { legacyDecoders } : {}),
    version: persistence.version,
  });
  if (PERSISTENCE_OWNED_CURRENT_INPUTS.has(persistence)) {
    PERSISTENCE_OWNED_CURRENT_INPUTS.add(defined);
  }

  return defined;
};

/** @internal */
export const supportsEditorValuePersistenceVersion = <
  TValue,
  TEncoded extends EditorJsonValue,
>(
  persistence: EditorValuePersistence<TValue, TEncoded>,
  version: number
) =>
  version === persistence.version ||
  Object.hasOwn(persistence.legacyDecoders ?? {}, version);

/** Strict codecs for primitive JSON state values. */
export const valueCodecs = Object.freeze({
  boolean: Object.freeze({
    decode(value: unknown) {
      if (typeof value !== 'boolean') {
        throw new Error('Expected a boolean editor value.');
      }

      return value;
    },
    encode: (value: boolean) => value,
  }),
  number: Object.freeze({
    decode(value: unknown) {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error('Expected a finite numeric editor value.');
      }

      return value;
    },
    encode: (value: number) => value,
  }),
  string: Object.freeze({
    decode(value: unknown) {
      if (typeof value !== 'string') {
        throw new Error('Expected a string editor value.');
      }

      return value;
    },
    encode: (value: string) => value,
  }),
});

export const encodeVersionedValue = <TValue, TEncoded extends EditorJsonValue>(
  persistence: EditorValuePersistence<TValue, TEncoded>,
  value: TValue,
  label: string
): SerializedEditorValue<TEncoded> =>
  snapshotEditorJsonValue(
    {
      value: persistence.encode(value),
      version: persistence.version,
    },
    label
  );

export const decodeVersionedValue = <TValue, TEncoded extends EditorJsonValue>(
  persistence: EditorValuePersistence<TValue, TEncoded>,
  input: unknown,
  label: string
): TValue => {
  if (
    !isRecord(input) ||
    !Object.hasOwn(input, 'value') ||
    !Number.isSafeInteger(input.version)
  ) {
    throw new Error(`Invalid ${label} envelope.`);
  }
  const version = input.version as number;
  if (!supportsEditorValuePersistenceVersion(persistence, version)) {
    const supported = [
      ...Object.keys(persistence.legacyDecoders ?? {}).map(Number),
      persistence.version,
    ].sort((left, right) => left - right);
    throw new Error(
      `Unsupported ${label} version ${String(version)}; expected ${supported.join(
        ' or '
      )}.`
    );
  }

  const decode =
    version === persistence.version
      ? persistence.decode
      : persistence.legacyDecoders?.[version];
  if (!decode) throw new Error(`Unsupported ${label} version.`);

  if (
    version === persistence.version &&
    PERSISTENCE_OWNED_CURRENT_INPUTS.has(persistence)
  ) {
    const decoded = decode(input.value);
    if (
      decoded !== null &&
      typeof decoded === 'object' &&
      !isOwnedJsonValue(decoded)
    ) {
      throw new Error(`${label} decoder must return owned JSON data.`);
    }

    return decoded;
  }

  return decode(cloneFrozenEditorJsonValue(input.value));
};

export const encodeEditorEffect = <TValue, TEncoded extends EditorJsonValue>(
  effect: EditorEffect<TValue, TEncoded>
): SerializedEditorEffect<TEncoded> => {
  const { persist } = effect.type;

  if (!persist) {
    throw new Error(
      `Editor effect "${effect.type.key}" does not define persistence.`
    );
  }

  return Object.freeze({
    key: effect.type.key,
    ...encodeVersionedValue(
      persist,
      effect.value,
      `editor effect "${effect.type.key}"`
    ),
  });
};

export const decodeEditorEffect = <TValue, TEncoded extends EditorJsonValue>(
  type: EditorEffectType<TValue, TEncoded>,
  input: unknown
): EditorEffect<TValue> => {
  if (!isRecord(input) || input.key !== type.key) {
    throw new Error(`Invalid editor effect "${type.key}" envelope.`);
  }
  if (!type.persist) {
    throw new Error(`Editor effect "${type.key}" does not define persistence.`);
  }

  return createEditorEffect(
    type,
    decodeVersionedValue(type.persist, input, `editor effect "${type.key}"`)
  );
};

export const assertEditorJsonValue = assertJsonValue;
