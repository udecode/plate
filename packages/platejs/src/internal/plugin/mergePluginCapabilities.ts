import { failInvariant } from '../failInvariant';

type PluginCapabilityKind = 'api' | 'read' | 'update';

type MergePluginCapabilitiesOptions = Readonly<{
  kind: PluginCapabilityKind;
  mapMethod?: (method: (...args: never[]) => unknown) => unknown;
  owner: string;
}>;

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const prototype = Object.getPrototypeOf(value);

  if (prototype === null) return true;
  const objectConstructor = Object.getOwnPropertyDescriptor(
    prototype,
    'constructor'
  )?.value;

  return (
    Object.getPrototypeOf(prototype) === null &&
    typeof objectConstructor === 'function' &&
    objectConstructor.name === 'Object'
  );
};

const CAPABILITY_FUNCTION_INTRINSIC_KEYS = new Set([
  'arguments',
  'caller',
  'length',
  'name',
  'prototype',
]);

const isValidFunctionIntrinsicDescriptor = (
  key: string,
  descriptor: PropertyDescriptor
) => {
  if (!('value' in descriptor) || descriptor.enumerable) return false;

  switch (key) {
    case 'length': {
      return (
        typeof descriptor.value === 'number' && descriptor.writable === false
      );
    }
    case 'name': {
      return (
        typeof descriptor.value === 'string' && descriptor.writable === false
      );
    }
    case 'arguments':
    case 'caller': {
      return (
        descriptor.value === null &&
        descriptor.writable === false &&
        descriptor.configurable === false
      );
    }
    case 'prototype': {
      return (
        typeof descriptor.value === 'object' &&
        descriptor.value !== null &&
        descriptor.configurable === false
      );
    }
    default: {
      return false;
    }
  }
};

const getEnumerableCapabilityEntries = (
  source: object,
  options: MergePluginCapabilitiesOptions,
  path: readonly string[]
) =>
  Reflect.ownKeys(source).flatMap((key) => {
    const descriptor =
      Object.getOwnPropertyDescriptor(source, key) ??
      failInvariant('Expected value to be defined');

    if (
      typeof source === 'function' &&
      typeof key === 'string' &&
      CAPABILITY_FUNCTION_INTRINSIC_KEYS.has(key)
    ) {
      if (!isValidFunctionIntrinsicDescriptor(key, descriptor)) {
        throw new TypeError(
          `Plate plugin "${options.owner}" ${options.kind} capability function intrinsic "${key}" was redefined.`
        );
      }
      return [];
    }
    if (typeof key === 'symbol') {
      if (options.kind === 'api') return [];

      throw new TypeError(
        `Plate plugin "${options.owner}" ${options.kind} capability symbols are not supported.`
      );
    }
    if (!('value' in descriptor)) {
      if (options.kind === 'api') {
        return descriptor.enumerable
          ? [[key, Reflect.get(source, key)] as const]
          : [];
      }

      throw new TypeError(
        `Plate plugin "${options.owner}" ${options.kind} capability "${[
          ...path,
          key,
        ].join('.')}" must not use an accessor.`
      );
    }
    if (!descriptor.enumerable) {
      if (options.kind === 'api') return [];

      throw new TypeError(
        `Plate plugin "${options.owner}" ${options.kind} capability "${[
          ...path,
          key,
        ].join('.')}" must be enumerable.`
      );
    }

    return [[key, descriptor.value] as const];
  });

const mergeCapabilityValue = (
  base: unknown,
  source: unknown,
  options: MergePluginCapabilitiesOptions,
  path: readonly string[]
): unknown => {
  if (source === undefined && options.kind === 'api') return base;
  if (typeof source === 'function') {
    if (
      options.kind === 'read' &&
      path.length === 0 &&
      isPlainRecord(base) &&
      Reflect.ownKeys(base).length > 0
    ) {
      throw new TypeError(
        `Plate plugin "${options.owner}" read capability cannot merge callable and record roots.`
      );
    }
    const method = options.mapMethod
      ? options.mapMethod(source as (...args: never[]) => unknown)
      : source;

    if (options.kind === 'api') return method;

    for (const [key, value] of getEnumerableCapabilityEntries(
      source,
      options,
      path
    )) {
      const member = mergeCapabilityValue(undefined, value, options, [
        ...path,
        key,
      ]);

      if (member !== value) {
        Object.defineProperty(method, key, {
          enumerable: true,
          value: member,
        });
      }
    }

    return Object.freeze(method);
  }
  if (isPlainRecord(source)) {
    if (
      options.kind === 'read' &&
      path.length === 0 &&
      typeof base === 'function'
    ) {
      throw new TypeError(
        `Plate plugin "${options.owner}" read capability cannot merge callable and record roots.`
      );
    }
    const baseRecord = isPlainRecord(base) ? base : {};
    const result: Record<string, unknown> = { ...baseRecord };

    for (const [key, value] of getEnumerableCapabilityEntries(
      source,
      options,
      path
    )) {
      const baseValue = Object.hasOwn(baseRecord, key)
        ? Object.getOwnPropertyDescriptor(baseRecord, key)?.value
        : undefined;
      const mergedValue = mergeCapabilityValue(baseValue, value, options, [
        ...path,
        key,
      ]);

      Object.defineProperty(result, key, {
        configurable: true,
        enumerable: true,
        value: mergedValue,
        writable: true,
      });
    }

    return Object.freeze(result);
  }
  if (options.kind === 'api') return source;

  throw new TypeError(
    `Plate plugin "${options.owner}" ${options.kind} capability "${path.join(
      '.'
    )}" must be a method or plain method record.`
  );
};

export const mergePluginCapabilities = (
  options: MergePluginCapabilitiesOptions,
  ...sources: readonly unknown[]
): unknown => {
  let result: unknown = {};

  for (const source of sources) {
    if (
      !isPlainRecord(source) &&
      !(options.kind === 'read' && typeof source === 'function')
    ) {
      throw new TypeError(
        `Plate plugin "${options.owner}" ${options.kind} factories must return a plain object.`
      );
    }

    result = mergeCapabilityValue(result, source, options, []);
  }

  return result;
};
