import mergeWith from 'lodash/mergeWith.js';

import type {
  BasePlugin,
  ErasedPluginCallable,
  ErasedPluginConfigurationLayer,
} from '../../lib';

type NominalPluginReference = Readonly<{ name: string }>;

const pluginDescriptors = new WeakSet<object>();
/** @internal */
export type PluginDescriptorMetadata = Readonly<{
  configured: boolean;
  configurationLayers: readonly ErasedPluginConfigurationLayer[];
  htmlCodecContributions: readonly Readonly<{
    extension: ErasedPluginCallable;
    targetPlugin: string | null;
  }>[];
  resolved: boolean;
  stages: readonly ErasedPluginCallable[];
}>;

const pluginDescriptorMetadata = new WeakMap<
  object,
  PluginDescriptorMetadata
>();
const pluginSchemaFamilies = new WeakMap<object, object>();
const htmlCodecSchemaFamilies = new WeakMap<
  (...args: never[]) => unknown,
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

  const configurationLayers =
    pluginDescriptorMetadata.get(value)?.configurationLayers;

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
  if (!pluginDescriptorMetadata.has(value)) {
    const sourceMetadata = familySource
      ? pluginDescriptorMetadata.get(familySource)
      : undefined;

    pluginDescriptorMetadata.set(
      value,
      sourceMetadata ??
        Object.freeze({
          configured: false,
          configurationLayers: Object.freeze([]),
          htmlCodecContributions: Object.freeze([]),
          resolved: false,
          stages: Object.freeze([]),
        })
    );
  }
  const family = familySource
    ? pluginSchemaFamilies.get(familySource)
    : pluginSchemaFamilies.get(value);

  pluginSchemaFamilies.set(value, family ?? createPluginSchemaFamily());

  return value;
};

export const getPluginDescriptorMetadata = (
  value: object
): PluginDescriptorMetadata => {
  const metadata = pluginDescriptorMetadata.get(value);

  if (!metadata) {
    throw new Error('Plate plugin metadata requires a nominal descriptor.');
  }

  return metadata;
};

export const setPluginDescriptorMetadata = (
  value: object,
  metadata: PluginDescriptorMetadata
) => {
  pluginDescriptorMetadata.set(value, Object.freeze(metadata));
};

export const isConfiguredPluginDescriptor = (value: object) =>
  pluginDescriptorMetadata.get(value)?.configured === true;

export const isResolvedPluginDescriptor = (value: object) =>
  pluginDescriptorMetadata.get(value)?.resolved === true;

export const getPluginSchemaFamily = (value: object): object | null =>
  pluginSchemaFamilies.get(value) ?? null;

export const registerHtmlCodecSchemaFamilies = <
  T extends (...args: never[]) => unknown,
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
  extension: (...args: never[]) => unknown
) => htmlCodecSchemaFamilies.get(extension);

const hasStringIdentity = (value: object): value is NominalPluginReference => {
  const name = Object.getOwnPropertyDescriptor(value, 'name');

  return (
    !!name && Object.hasOwn(name, 'value') && typeof name.value === 'string'
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
  if (isNominalPluginDescriptor(value)) return value;

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

const isDeepFrozenDataValue = (
  value: unknown,
  seen = new WeakSet<object>()
): boolean => {
  if (!value || typeof value !== 'object') return true;
  if (seen.has(value)) return true;

  const prototype = Object.getPrototypeOf(value);

  if (
    prototype !== Object.prototype &&
    prototype !== null &&
    !Array.isArray(value)
  ) {
    return true;
  }
  if (!Object.isFrozen(value)) return false;

  seen.add(value);

  return Reflect.ownKeys(value).every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    return (
      !!descriptor &&
      Object.hasOwn(descriptor, 'value') &&
      isDeepFrozenDataValue(descriptor.value, seen)
    );
  });
};

export const freezePluginDescriptorValue = <T>(value: T): T =>
  typeof value === 'function' ||
  (value !== null &&
    typeof value === 'object' &&
    typeof Reflect.get(value, 'name') === 'string' &&
    isDeepFrozenDataValue(value))
    ? value
    : cloneFrozenPluginDescriptor(value);

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

export function mergePlugins<T>(basePlugin: T, ...sourcePlugins: unknown[]): T {
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
