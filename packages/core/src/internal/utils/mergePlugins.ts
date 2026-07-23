import mergeWith from 'lodash/mergeWith.js';
import { isPropertyPolicyToken } from '@platejs/plite/internal';

import type { BasePlugin } from '../../lib';

export const isNominalSchemaConfigToken = (value: unknown) =>
  isPropertyPolicyToken(value);

type NominalPluginReference = Readonly<{ key: string; type: string }>;

const pluginDescriptors = new WeakSet<object>();

export const brandPluginDescriptor = <T extends object>(value: T): T => {
  pluginDescriptors.add(value);

  return value;
};

const hasStringIdentity = (value: object): value is NominalPluginReference => {
  const key = Object.getOwnPropertyDescriptor(value, 'key');
  const type = Object.getOwnPropertyDescriptor(value, 'type');

  return (
    !!key &&
    Object.hasOwn(key, 'value') &&
    typeof key.value === 'string' &&
    !!type &&
    Object.hasOwn(type, 'value') &&
    typeof type.value === 'string'
  );
};

export const isNominalPluginDescriptor = (
  value: unknown
): value is NominalPluginReference =>
  typeof value === 'object' &&
  value !== null &&
  pluginDescriptors.has(value) &&
  hasStringIdentity(value);

export const isNominalPluginReference = (
  value: unknown
): value is NominalPluginReference => isNominalPluginDescriptor(value);

const cloneFrozenPluginDescriptor = <T>(
  value: T,
  clones = new WeakMap<object, unknown>()
): T => {
  if (!value || typeof value !== 'object') return value;
  if (isNominalSchemaConfigToken(value)) return value;

  const existing = clones.get(value);

  if (existing !== undefined) return existing as T;
  if (Array.isArray(value)) {
    const clone = value.map((item) =>
      cloneFrozenPluginDescriptor(item, clones)
    );

    clones.set(value, clone);

    return Object.freeze(clone) as T;
  }

  const prototype = Object.getPrototypeOf(value);

  if (prototype !== Object.prototype && prototype !== null) return value;

  const clone: Record<PropertyKey, unknown> = {};

  clones.set(value, clone);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor || !Object.hasOwn(descriptor, 'value')) return value;

    Object.defineProperty(clone, key, {
      enumerable: descriptor.enumerable,
      value: cloneFrozenPluginDescriptor(descriptor.value, clones),
    });
  }

  return Object.freeze(clone) as T;
};

export const freezePluginDescriptorValue = <T>(value: T): T =>
  typeof value === 'function' ? value : cloneFrozenPluginDescriptor(value);

const mergeDefinedProperties = (
  base: unknown,
  source: unknown
): Record<PropertyKey, unknown> => {
  const merged = {
    ...((base ?? {}) as Record<PropertyKey, unknown>),
  };

  if (!source || typeof source !== 'object') return merged;

  for (const key of Reflect.ownKeys(source)) {
    const value = (source as Record<PropertyKey, unknown>)[key];

    if (value !== undefined) merged[key] = value;
  }

  return merged;
};

const moveEditorApiDeclaration = (value: unknown) => {
  if (!value || typeof value !== 'object' || !Object.hasOwn(value, 'api')) {
    return value;
  }

  const { api, ...descriptor } = value as Record<PropertyKey, unknown>;

  return {
    ...descriptor,
    __editorApi: mergeWith({}, descriptor.__editorApi ?? {}, api ?? {}),
  };
};

export function mergePlugins<T>(basePlugin: T, ...sourcePlugins: any[]): T {
  const preservesDescriptorIdentity = [basePlugin, ...sourcePlugins].some(
    isNominalPluginDescriptor
  );
  const plugins = [basePlugin, ...sourcePlugins].map(moveEditorApiDeclaration);
  const merged = mergeWith(
    {},
    ...plugins,
    (objValue: unknown, srcValue: unknown, key: keyof BasePlugin) => {
      // Plite declarations can carry non-enumerable policy functions. Treat
      // frozen opaque values as immutable leaves so lodash cannot strip them.
      if (isNominalSchemaConfigToken(srcValue)) return srcValue;

      // Overwrite array (including plugins) without cloning
      if (Array.isArray(srcValue)) {
        return srcValue;
      }
      // Schema descriptors are one semantic unit. Partial deep merges can
      // combine incompatible element/mark declarations across revisions.
      if (key === 'schema') return srcValue;

      // Shallow merge options
      if (key === 'options') {
        return mergeDefinedProperties(objValue, srcValue);
      }
    }
  );

  return preservesDescriptorIdentity && merged && typeof merged === 'object'
    ? (brandPluginDescriptor(merged) as T)
    : merged;
}
