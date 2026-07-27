import mergeWith from 'lodash/mergeWith.js';

import type { BasePlugin } from '../../lib';

type NominalPluginReference = Readonly<{ key: string; type: string }>;

const pluginDescriptors = new WeakSet<object>();
const pluginSchemaFamilies = new WeakMap<object, object>();
const htmlCodecSchemaFamilies = new WeakMap<
  (...args: any[]) => unknown,
  Readonly<{
    owner: object | null;
    target: object | null;
  }>
>();

const createPluginSchemaFamily = (): object => Object.freeze(() => {});

const opaquePluginRenderKeys = new Set<PropertyKey>([
  'aboveEditable',
  'abovePlite',
  'afterContainer',
  'afterEditable',
  'beforeContainer',
  'beforeEditable',
  'leaf',
  'node',
]);

export const isOpaquePluginRenderKey = (key: PropertyKey) =>
  opaquePluginRenderKeys.has(key);

const isObjectReference = (value: unknown): value is object =>
  (typeof value === 'object' && value !== null) || typeof value === 'function';

const getDataProperty = (value: object, key: PropertyKey) => {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);

  return descriptor && Object.hasOwn(descriptor, 'value')
    ? descriptor.value
    : undefined;
};

const collectOpaquePluginHostResources = (
  value: unknown,
  resources: WeakSet<object>,
  visited = new WeakSet<object>()
) => {
  if (!isObjectReference(value) || visited.has(value)) return;

  visited.add(value);
  const render = getDataProperty(value, 'render');

  if (isObjectReference(render)) {
    opaquePluginRenderKeys.forEach((key) => {
      const resource = getDataProperty(render, key);

      if (isObjectReference(resource)) resources.add(resource);
    });
  }

  const collectPluginRecord = (record: unknown) => {
    if (!isObjectReference(record)) return;

    Reflect.ownKeys(record).forEach((key) => {
      collectOpaquePluginHostResources(
        getDataProperty(record, key),
        resources,
        visited
      );
    });
  };
  const override = getDataProperty(value, 'override');

  if (isObjectReference(override)) {
    const components = getDataProperty(override, 'components');

    if (isObjectReference(components)) {
      Reflect.ownKeys(components).forEach((key) => {
        const resource = getDataProperty(components, key);

        if (isObjectReference(resource)) resources.add(resource);
      });
    }
    collectPluginRecord(getDataProperty(override, 'plugins'));
  }

  const inject = getDataProperty(value, 'inject');

  if (isObjectReference(inject)) {
    collectPluginRecord(getDataProperty(inject, 'parsers'));
  }

  const configurationLayers = getDataProperty(value, '__configurationLayers');

  if (Array.isArray(configurationLayers)) {
    configurationLayers.forEach((layer) => {
      if (!isObjectReference(layer)) return;

      collectOpaquePluginHostResources(
        getDataProperty(layer, 'value'),
        resources,
        visited
      );
    });
  }
};

export const brandPluginDescriptor = <T extends object>(
  value: T,
  familySource?: object
): T => {
  lockPluginSchema(value);
  pluginDescriptors.add(value);
  const family = familySource
    ? pluginSchemaFamilies.get(familySource)
    : pluginSchemaFamilies.get(value);

  pluginSchemaFamilies.set(value, family ?? createPluginSchemaFamily());

  return value;
};

export const getPluginSchemaFamily = (value: object): object | null =>
  pluginSchemaFamilies.get(value) ?? null;

export const registerHtmlCodecSchemaFamilies = <
  T extends (...args: any[]) => unknown,
>(
  extension: T,
  owner: object,
  target: object
): T => {
  htmlCodecSchemaFamilies.set(
    extension,
    Object.freeze({
      owner: getPluginSchemaFamily(owner),
      target: getPluginSchemaFamily(target),
    })
  );

  return extension;
};

export const getHtmlCodecSchemaFamilies = (
  extension: (...args: any[]) => unknown
) => htmlCodecSchemaFamilies.get(extension);

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

function lockPluginSchema(value: object) {
  const descriptor = Object.getOwnPropertyDescriptor(value, 'schema');

  if (!descriptor || !Object.hasOwn(descriptor, 'value')) return;
  if (descriptor.configurable === false && descriptor.writable === false) {
    return;
  }

  Object.defineProperty(value, 'schema', {
    configurable: false,
    enumerable: descriptor.enumerable,
    value: freezePluginDescriptorValue(descriptor.value),
    writable: false,
  });
}

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

export function mergePlugins<T>(basePlugin: T, ...sourcePlugins: any[]): T {
  const identitySources = [basePlugin, ...sourcePlugins].filter(
    isNominalPluginDescriptor
  );
  const preservesDescriptorIdentity = identitySources.length > 0;
  const schemaFamilies = new Set(
    identitySources.map((source) => getPluginSchemaFamily(source))
  );

  if (schemaFamilies.size > 1) {
    throw new Error(
      'Plate cannot merge plugin descriptors from different schema families.'
    );
  }
  const plugins = [basePlugin, ...sourcePlugins];
  const opaqueHostResources = new WeakSet<object>();

  plugins.forEach((plugin) => {
    collectOpaquePluginHostResources(plugin, opaqueHostResources);
  });
  const merged = mergeWith(
    {},
    ...plugins,
    (objValue: unknown, srcValue: unknown, key: keyof BasePlugin) => {
      if (isObjectReference(srcValue) && opaqueHostResources.has(srcValue)) {
        return srcValue;
      }

      // Overwrite arrays without cloning.
      if (Array.isArray(srcValue)) {
        return srcValue;
      }
      // Schema descriptors are one semantic unit. Partial deep merges can
      // combine incompatible element/mark declarations across revisions.
      if (key === 'schema') return srcValue;

      // Shallow merge plugin initial state.
      if (key === 'initialState') {
        return mergeDefinedProperties(objValue, srcValue);
      }
    }
  );

  return preservesDescriptorIdentity && merged && typeof merged === 'object'
    ? (brandPluginDescriptor(merged, identitySources[0]) as T)
    : merged;
}
