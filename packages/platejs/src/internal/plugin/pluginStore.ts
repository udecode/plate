import { create } from 'mutative';

import type {
  AnyBasePluginDefinition,
  AnyBasePlugin,
  InferPluginStoreState,
  InferSelectors,
  PluginReference,
  PluginStore,
} from '../../lib';
import type { ZustandStoreApi } from '../../lib/libs/zustand';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import {
  brandPluginDescriptor,
  getPluginSchemaFamily,
  isNominalPluginDescriptor,
} from '../utils/mergePlugins';
import { getPlateRuntimeOwner } from './plateRuntime';

type PluginStoreBase<
  C extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = ZustandStoreApi<InferPluginStoreState<C>>;

export type InternalPluginStore<
  C extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = {
  readonly base: PluginStoreBase<C>;
  readonly public: PluginStore<C>;
  readonly selectors: InferSelectors<C>;
};

export const createPluginStore = <C extends AnyBasePluginDefinition>(
  plugin: AnyBasePlugin | PluginReference<C['name']> | C['name'],
  base: PluginStoreBase<C>,
  selectors: InferSelectors<C>
): InternalPluginStore<C> => {
  const name = typeof plugin === 'string' ? plugin : plugin.name;
  const state = base.store.getState();

  for (const key of Object.keys(selectors)) {
    if (Object.hasOwn(state, key)) {
      throw new Error(
        `Plate plugin "${name}" defines "${key}" as both state and selector.`
      );
    }
  }

  const replace = (value: InferPluginStoreState<C>) => {
    base.set('state', snapshotPluginState(value) as never);
  };
  const store: PluginStore<C> = {
    get(key?: PropertyKey, ...args: unknown[]) {
      const current = base.store.getState();

      if (key === undefined) return current;
      const selector = selectors[key as keyof InferSelectors<C>];

      if (typeof selector === 'function') {
        return selector(current, ...args);
      }
      if (Object.hasOwn(current, key)) {
        return current[key as keyof InferPluginStoreState<C>];
      }

      throw new Error(
        `Plate plugin "${name}" has no state field or selector "${String(key)}".`
      );
    },
    set(value) {
      const current = base.store.getState();

      if (typeof value === 'function') {
        replace(create(current, value as never) as InferPluginStoreState<C>);
      } else {
        replace({ ...current, ...value });
      }
    },
    subscribe: base.store.subscribe,
  } as PluginStore<C>;

  return Object.freeze({
    base,
    public: Object.freeze(store),
    selectors: Object.freeze({ ...selectors }) as InferSelectors<C>,
  });
};

const isMinimalPluginReference = (value: object) =>
  Object.isFrozen(value) &&
  Reflect.ownKeys(value).every((key) => key === 'name');

type PluginStateSnapshotContext = Readonly<{
  canonicalReferences?: WeakMap<object, Map<string, unknown>>;
  references: WeakMap<object, unknown>;
  snapshots: WeakMap<object, unknown>;
}>;

const snapshotPluginStateValue = (
  value: unknown,
  context: PluginStateSnapshotContext
): unknown => {
  if (!value || typeof value !== 'object') return value;
  if (isNominalPluginDescriptor(value)) {
    const family = getPluginSchemaFamily(value);
    const canonicalByName = family
      ? context.canonicalReferences?.get(family)
      : undefined;
    const canonicalReference = canonicalByName?.get(value.name);

    if (canonicalReference) return canonicalReference;
    if (isMinimalPluginReference(value)) {
      if (context.canonicalReferences && family) {
        const byName = canonicalByName ?? new Map<string, unknown>();

        byName.set(value.name, value);
        context.canonicalReferences.set(family, byName);
      }

      return value;
    }
    const existingReference = context.references.get(value);

    if (existingReference) return existingReference;
    const reference = Object.freeze(
      brandPluginDescriptor({ name: value.name }, value)
    );

    context.references.set(value, reference);
    if (context.canonicalReferences && family) {
      const byName = canonicalByName ?? new Map<string, unknown>();

      byName.set(value.name, reference);
      context.canonicalReferences.set(family, byName);
    }

    return reference;
  }
  const existing = context.snapshots.get(value);

  if (existing !== undefined) return existing;
  if (Array.isArray(value)) {
    const snapshot: unknown[] = [];

    context.snapshots.set(value, snapshot);
    snapshot.push(
      ...value.map((item) => snapshotPluginStateValue(item, context))
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
        'Plate plugin `initialState` must be data-only. Accessor properties are not supported; declare computed values as pure plugin selectors.'
      );
    }
    Object.defineProperty(snapshot, key, {
      enumerable: descriptor.enumerable,
      value: snapshotPluginStateValue(descriptor.value, context),
    });
  }

  return Object.freeze(snapshot);
};

/** Own one initial-state graph without retaining caller-owned plain data. */
export const snapshotPluginState = <T>(value: T): T =>
  snapshotPluginStateValue(value, {
    references: new WeakMap<object, unknown>(),
    snapshots: new WeakMap<object, unknown>(),
  }) as T;

/** Canonicalize resolved state graphs through one editor-local token set. */
export const createPluginStateSnapshot = () => {
  const context: PluginStateSnapshotContext = {
    canonicalReferences: new WeakMap(),
    references: new WeakMap<object, unknown>(),
    snapshots: new WeakMap<object, unknown>(),
  };

  return <T>(value: T): T => snapshotPluginStateValue(value, context) as T;
};

const PLUGIN_STORES = new WeakMap<object, Map<string, unknown>>();

export const clearPluginStores = (editor: object) => {
  PLUGIN_STORES.delete(getPlateRuntimeOwner(editor));
};

export function getPluginStore<P extends AnyBasePlugin & PluginReference>(
  editor: object,
  plugin: P
): InternalPluginStore<InternalPluginDefinitionOf<P>> | undefined;
export function getPluginStore<C extends AnyBasePluginDefinition>(
  editor: object,
  plugin: C['name']
): InternalPluginStore<C> | undefined;
export function getPluginStore(
  editor: object,
  plugin: AnyBasePlugin | PluginReference | string
): InternalPluginStore | undefined;
export function getPluginStore(
  editor: object,
  plugin: AnyBasePlugin | PluginReference | string
): unknown {
  const name = typeof plugin === 'string' ? plugin : plugin.name;

  return PLUGIN_STORES.get(getPlateRuntimeOwner(editor))?.get(name);
}

export const setPluginStore = <C extends AnyBasePluginDefinition>(
  editor: object,
  plugin: AnyBasePlugin | PluginReference<C['name']> | C['name'],
  store: InternalPluginStore<C>
) => {
  const name = typeof plugin === 'string' ? plugin : plugin.name;
  const owner = getPlateRuntimeOwner(editor);
  let stores = PLUGIN_STORES.get(owner);

  if (!stores) {
    stores = new Map();
    PLUGIN_STORES.set(owner, stores);
  }
  stores.set(name, store);
};
