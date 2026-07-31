import { create } from 'mutative';
import type { TBaseStateApi } from 'zustand-x/vanilla';

import type {
  AnyBasePluginDefinition,
  AnyBasePlugin,
  InferPluginStoreState,
  InferSelectors,
  PluginReference,
  PluginStore,
} from '../../lib';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import {
  brandPluginDescriptor,
  isNominalPluginDescriptor,
} from '../utils/mergePlugins';
import { getPlateRuntimeOwner } from './plateRuntime';

type PluginStoreBase<
  C extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = TBaseStateApi<
  InferPluginStoreState<C>,
  [['zustand/mutative-x', never]],
  {},
  {}
>;

export type InternalPluginStore<
  C extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = {
  readonly base: PluginStoreBase<C>;
  readonly public: PluginStore<C>;
  readonly selectors: InferSelectors<C>;
};

export const createPluginStore = <C extends AnyBasePluginDefinition>(
  pluginName: C['name'],
  base: PluginStoreBase<C>,
  selectors: InferSelectors<C>
): InternalPluginStore<C> => {
  const state = base.store.getState();

  for (const key of Object.keys(selectors)) {
    if (Object.hasOwn(state, key)) {
      throw new Error(
        `Plate plugin "${pluginName}" defines "${key}" as both state and selector.`
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
        `Plate plugin "${pluginName}" has no state field or selector "${String(key)}".`
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
  Reflect.ownKeys(value).every((key) => key === 'name' || key === 'type');

type PluginStateSnapshotContext = Readonly<{
  canonicalReferences?: Map<string, Map<string, unknown>>;
  references: WeakMap<object, unknown>;
  snapshots: WeakMap<object, unknown>;
}>;

const snapshotPluginStateValue = (
  value: unknown,
  context: PluginStateSnapshotContext
): unknown => {
  if (!value || typeof value !== 'object') return value;
  if (isNominalPluginDescriptor(value)) {
    const canonicalByType = context.canonicalReferences?.get(value.name);
    const canonicalReference = canonicalByType?.get(value.type);

    if (canonicalReference) return canonicalReference;
    if (isMinimalPluginReference(value)) {
      if (context.canonicalReferences) {
        const byType = canonicalByType ?? new Map<string, unknown>();

        byType.set(value.type, value);
        context.canonicalReferences.set(value.name, byType);
      }

      return value;
    }
    const existingReference = context.references.get(value);

    if (existingReference) return existingReference;
    const reference = Object.freeze(
      brandPluginDescriptor({ name: value.name, type: value.type })
    );

    context.references.set(value, reference);
    if (context.canonicalReferences) {
      const byType = canonicalByType ?? new Map<string, unknown>();

      byType.set(value.type, reference);
      context.canonicalReferences.set(value.name, byType);
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
    canonicalReferences: new Map(),
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
  pluginName: C['name']
): InternalPluginStore<C> | undefined;
export function getPluginStore(
  editor: object,
  plugin: PluginReference | string
): unknown {
  const pluginName = typeof plugin === 'string' ? plugin : plugin.name;

  return PLUGIN_STORES.get(getPlateRuntimeOwner(editor))?.get(pluginName);
}

export const setPluginStore = <C extends AnyBasePluginDefinition>(
  editor: object,
  pluginName: C['name'],
  store: InternalPluginStore<C>
) => {
  const owner = getPlateRuntimeOwner(editor);
  let stores = PLUGIN_STORES.get(owner);

  if (!stores) {
    stores = new Map();
    PLUGIN_STORES.set(owner, stores);
  }
  stores.set(pluginName, store);
};
