import type { TBaseStateApi } from 'zustand-x/vanilla';

import type { AnyPluginConfig, InferOptions, InferSelectors } from '../../lib';
import {
  brandPluginDescriptor,
  isNominalPluginDescriptor,
  isNominalSchemaConfigToken,
} from '../utils/mergePlugins';
import { getPlateRuntimeOwner } from './plateRuntime';

export type PluginOptionsStore<C extends AnyPluginConfig = AnyPluginConfig> =
  TBaseStateApi<
    InferOptions<C>,
    [['zustand/mutative-x', never]],
    {},
    InferSelectors<C>
  >;

const isMinimalPluginReference = (value: object) =>
  Object.isFrozen(value) &&
  Reflect.ownKeys(value).every((key) => key === 'key' || key === 'type');

type PluginOptionSnapshotContext = Readonly<{
  canonicalReferences?: Map<string, Map<string, unknown>>;
  references: WeakMap<object, unknown>;
  snapshots: WeakMap<object, unknown>;
}>;

const snapshotPluginOptionValue = (
  value: unknown,
  context: PluginOptionSnapshotContext
): unknown => {
  if (!value || typeof value !== 'object') return value;
  if (isNominalSchemaConfigToken(value)) return value;
  if (isNominalPluginDescriptor(value)) {
    const canonicalByType = context.canonicalReferences?.get(value.key);
    const canonicalReference = canonicalByType?.get(value.type);

    if (canonicalReference) return canonicalReference;
    if (isMinimalPluginReference(value)) {
      if (context.canonicalReferences) {
        const byType = canonicalByType ?? new Map<string, unknown>();

        byType.set(value.type, value);
        context.canonicalReferences.set(value.key, byType);
      }

      return value;
    }
    const existingReference = context.references.get(value);

    if (existingReference) return existingReference;
    const reference = Object.freeze(
      brandPluginDescriptor({ key: value.key, type: value.type })
    );

    context.references.set(value, reference);
    if (context.canonicalReferences) {
      const byType = canonicalByType ?? new Map<string, unknown>();

      byType.set(value.type, reference);
      context.canonicalReferences.set(value.key, byType);
    }

    return reference;
  }
  const existing = context.snapshots.get(value);

  if (existing !== undefined) return existing;
  if (Array.isArray(value)) {
    const snapshot: unknown[] = [];

    context.snapshots.set(value, snapshot);
    snapshot.push(
      ...value.map((item) => snapshotPluginOptionValue(item, context))
    );

    return Object.freeze(snapshot);
  }
  const prototype = Object.getPrototypeOf(value);

  if (prototype !== Object.prototype && prototype !== null) return value;
  const snapshot: Record<PropertyKey, unknown> = Object.create(prototype);

  context.snapshots.set(value, snapshot);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor) continue;
    if (!Object.hasOwn(descriptor, 'value')) {
      throw new Error(
        'Plate plugin options must be data-only. Accessor properties are not supported; use .extendSelectors() for computed values.'
      );
    }
    Object.defineProperty(snapshot, key, {
      enumerable: descriptor.enumerable,
      value: snapshotPluginOptionValue(descriptor.value, context),
    });
  }

  return Object.freeze(snapshot);
};

/** Own one immutable option graph without retaining caller-owned plain data. */
export const snapshotPluginOptions = <T>(value: T): T =>
  snapshotPluginOptionValue(value, {
    references: new WeakMap<object, unknown>(),
    snapshots: new WeakMap<object, unknown>(),
  }) as T;

/** Canonicalize resolved option graphs through one editor-local token set. */
export const createPluginOptionsSnapshot = () => {
  const context: PluginOptionSnapshotContext = {
    canonicalReferences: new Map(),
    references: new WeakMap<object, unknown>(),
    snapshots: new WeakMap<object, unknown>(),
  };

  return <T>(value: T): T => snapshotPluginOptionValue(value, context) as T;
};

const PLUGIN_OPTIONS_STORES = new WeakMap<
  object,
  Map<string, PluginOptionsStore>
>();

export const clearPluginOptionsStores = (editor: object) => {
  PLUGIN_OPTIONS_STORES.delete(getPlateRuntimeOwner(editor));
};

export const getPluginOptionsStore = <C extends AnyPluginConfig>(
  editor: object,
  pluginKey: C['key']
) =>
  PLUGIN_OPTIONS_STORES.get(getPlateRuntimeOwner(editor))?.get(pluginKey) as
    | PluginOptionsStore<C>
    | undefined;

export const setPluginOptionsStore = <C extends AnyPluginConfig>(
  editor: object,
  pluginKey: C['key'],
  store: PluginOptionsStore<C>
) => {
  const owner = getPlateRuntimeOwner(editor);
  let stores = PLUGIN_OPTIONS_STORES.get(owner);

  if (!stores) {
    stores = new Map();
    PLUGIN_OPTIONS_STORES.set(owner, stores);
  }
  stores.set(pluginKey, store as PluginOptionsStore);
};
