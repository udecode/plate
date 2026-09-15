import type {
  EditorEffect,
  EditorEffectType,
  EditorValueCodec,
  SerializedEditorEffect,
  SerializedEditorValue,
} from '../interfaces/editor';
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

const assertCodecVersion = (version: number) => {
  if (!Number.isSafeInteger(version) || version < 1) {
    throw new Error('Editor value codec version must be a positive integer.');
  }
};

const assertJsonValue = (value: unknown, label: string) => {
  if (!isEditorJsonValue(value)) {
    throw new Error(`${label} must encode to JSON-compatible data.`);
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const CODEC_OWNED_CURRENT_INPUTS = new WeakSet<object>();

/**
 * Mark a codec whose current-version decoder validates and detaches its own
 * input before returning an owned editor JSON value.
 *
 * @internal
 */
export const ownCurrentEditorValueCodecInput = <TValue>(
  codec: EditorValueCodec<TValue>
): EditorValueCodec<TValue> => {
  CODEC_OWNED_CURRENT_INPUTS.add(codec);

  return codec;
};

/** Define a versioned codec for persisted editor state and effects. */
export const defineValueCodec = <TValue>(
  codec: EditorValueCodec<TValue>
): EditorValueCodec<TValue> => {
  assertCodecVersion(codec.version);

  const previousVersions = codec.previousVersions
    ? Object.freeze({ ...codec.previousVersions })
    : undefined;
  for (const [savedVersion, decode] of Object.entries(previousVersions ?? {})) {
    const version = Number(savedVersion);
    if (
      !Number.isSafeInteger(version) ||
      version < 1 ||
      version >= codec.version ||
      typeof decode !== 'function'
    ) {
      throw new Error(
        'Editor value codec previous versions must be positive integers below the current version.'
      );
    }
  }

  const defined = Object.freeze({
    ...codec,
    ...(previousVersions ? { previousVersions } : {}),
  });
  if (CODEC_OWNED_CURRENT_INPUTS.has(codec)) {
    CODEC_OWNED_CURRENT_INPUTS.add(defined);
  }

  return defined;
};

/** @internal */
export const supportsEditorValueCodecVersion = <TValue>(
  codec: EditorValueCodec<TValue>,
  version: number
) =>
  version === codec.version ||
  Object.hasOwn(codec.previousVersions ?? {}, version);

/** Strict codecs for primitive JSON state values. */
export const valueCodecs = Object.freeze({
  boolean: defineValueCodec<boolean>({
    decode(value) {
      if (typeof value !== 'boolean') {
        throw new Error('Expected a boolean editor value.');
      }

      return value;
    },
    encode: (value) => value,
    version: 1,
  }),
  number: defineValueCodec<number>({
    decode(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error('Expected a finite numeric editor value.');
      }

      return value;
    },
    encode: (value) => value,
    version: 1,
  }),
  string: defineValueCodec<string>({
    decode(value) {
      if (typeof value !== 'string') {
        throw new Error('Expected a string editor value.');
      }

      return value;
    },
    encode: (value) => value,
    version: 1,
  }),
});

export const encodeVersionedValue = <TValue>(
  codec: EditorValueCodec<TValue>,
  value: TValue,
  label: string
): SerializedEditorValue =>
  snapshotEditorJsonValue(
    { value: codec.encode(value), version: codec.version },
    label
  );

export const decodeVersionedValue = <TValue>(
  codec: EditorValueCodec<TValue>,
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
  if (!supportsEditorValueCodecVersion(codec, version)) {
    const supported = [
      ...Object.keys(codec.previousVersions ?? {}).map(Number),
      codec.version,
    ].sort((left, right) => left - right);
    throw new Error(
      `Unsupported ${label} version ${String(version)}; expected ${supported.join(
        ' or '
      )}.`
    );
  }

  const decode =
    version === codec.version
      ? codec.decode
      : codec.previousVersions?.[version];
  if (!decode) throw new Error(`Unsupported ${label} version.`);

  if (version === codec.version && CODEC_OWNED_CURRENT_INPUTS.has(codec)) {
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

export const encodeEditorEffect = <TValue>(
  effect: EditorEffect<TValue>
): SerializedEditorEffect => {
  const { codec } = effect.type;

  if (!codec) {
    throw new Error(
      `Editor effect "${effect.type.key}" does not define a persistence codec.`
    );
  }

  return Object.freeze({
    key: effect.type.key,
    ...encodeVersionedValue(
      codec,
      effect.value,
      `editor effect "${effect.type.key}"`
    ),
  });
};

export const decodeEditorEffect = <TValue>(
  type: EditorEffectType<TValue>,
  input: unknown
): EditorEffect<TValue> => {
  if (!isRecord(input) || input.key !== type.key) {
    throw new Error(`Invalid editor effect "${type.key}" envelope.`);
  }
  if (!type.codec) {
    throw new Error(
      `Editor effect "${type.key}" does not define a persistence codec.`
    );
  }

  return createEditorEffect(
    type,
    decodeVersionedValue(type.codec, input, `editor effect "${type.key}"`)
  );
};

export const assertEditorJsonValue = assertJsonValue;
