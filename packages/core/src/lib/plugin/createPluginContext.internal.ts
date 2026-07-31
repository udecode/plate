import type { Value } from '@platejs/plite';

import type { BaseEditor } from '../editor';
import type {
  AnyBasePluginDefinition,
  PluginReference,
  PluginStore,
} from './PluginDefinition';
import type { InternalPluginDefinitionOf } from './pluginDefinitionLookup.internal';
import type {
  AnyBasePlugin,
  AnyBasePluginContext,
  AnyBasePluginPortal,
  AnyResolvedBasePlugin,
  BasePluginContext,
  BasePluginPortal,
} from './BasePlugin';
import { createDefinePluginCodecs } from './pluginAuthoringContext';
import {
  getCompiledPlatePlugin,
  getCompiledPlatePluginApi,
  hasCompiledPlatePluginCandidate,
  hasCompiledPlatePluginApiCandidate,
  isResolvingPlatePlugin,
} from '../../internal/plugin/compilePlateModel';
import { getPluginStore } from '../../internal/plugin/pluginStore';
import {
  getPluginSchemaFamily,
  isNominalPluginDescriptor,
} from '../../internal/utils/mergePlugins';

const isResolvedBasePluginDescriptor = (
  value: unknown
): value is AnyBasePlugin =>
  isNominalPluginDescriptor(value) && Reflect.get(value, '__resolved') === true;

export function createPluginPortal<
  V extends Value,
  E extends AnyBasePluginDefinition,
  P extends (AnyBasePlugin | AnyResolvedBasePlugin) & PluginReference,
>(
  editor: BaseEditor<V, E>,
  p: P
): BasePluginPortal<InternalPluginDefinitionOf<P>>;
export function createPluginPortal(
  editor: BaseEditor,
  plugin: AnyBasePlugin | AnyResolvedBasePlugin | string
): AnyBasePluginPortal;
export function createPluginPortal(
  editor: object,
  plugin: AnyBasePlugin | AnyResolvedBasePlugin | string
): unknown {
  return createPluginAccess(editor, plugin, false);
}

export function createPluginContext<
  V extends Value,
  E extends AnyBasePluginDefinition,
  P extends (AnyBasePlugin | AnyResolvedBasePlugin) & PluginReference,
>(
  editor: BaseEditor<V, E>,
  p: P
): BasePluginContext<InternalPluginDefinitionOf<P>>;
export function createPluginContext(
  editor: BaseEditor,
  plugin: AnyBasePlugin | AnyResolvedBasePlugin | string
): AnyBasePluginContext;
export function createPluginContext(
  editor: object,
  plugin: AnyBasePlugin | AnyResolvedBasePlugin | string
): unknown {
  return createPluginAccess(editor, plugin, true);
}

const createPluginAccess = (
  editor: object,
  input: AnyBasePlugin | AnyResolvedBasePlugin | string,
  authoring: boolean
): AnyBasePluginContext | AnyBasePluginPortal => {
  if (typeof input !== 'string' && !isNominalPluginDescriptor(input)) {
    throw new TypeError(
      'Plate plugin lookup requires a plugin descriptor or plugin name string.'
    );
  }

  const descriptor = typeof input === 'string' ? undefined : input;
  const name = typeof input === 'string' ? input : input.name;
  const provided =
    descriptor && isResolvedBasePluginDescriptor(descriptor)
      ? descriptor
      : undefined;
  const matchesDescriptorFamily = (plugin: AnyBasePlugin) =>
    !descriptor ||
    !isNominalPluginDescriptor(descriptor) ||
    getPluginSchemaFamily(descriptor) === getPluginSchemaFamily(plugin);
  const getCandidate = () => {
    if (!provided) return;
    if (isResolvingPlatePlugin(editor, provided)) return provided;
    if (!hasCompiledPlatePluginCandidate(editor)) return;
    const compiled = getCompiledPlatePlugin(editor, name);

    if (provided === compiled) return provided;
  };
  const getPlugin = () => {
    const plugin = getCandidate() ?? getCompiledPlatePlugin(editor, name);

    if (!plugin) {
      throw new Error(`Plate plugin "${name}" is not installed.`);
    }
    if (!matchesDescriptorFamily(plugin)) {
      throw new Error(
        `Plate plugin "${name}" resolves to a different descriptor family.`
      );
    }

    return plugin;
  };
  const isInstalled = () => {
    const plugin = getCandidate() ?? getCompiledPlatePlugin(editor, name);

    return plugin !== undefined && matchesDescriptorFamily(plugin);
  };
  const getStore = () => getPluginStore(editor, getPlugin().name);
  const createApiFacade = (path: readonly PropertyKey[]): unknown =>
    new Proxy(
      (...args: unknown[]) => {
        let owner: unknown =
          getCompiledPlatePluginApi(editor, getPlugin().name) ?? {};
        let value = owner;

        for (const key of path) {
          owner = value;
          value =
            value && (typeof value === 'object' || typeof value === 'function')
              ? (value as Record<PropertyKey, unknown>)[key]
              : undefined;
        }

        if (typeof value !== 'function') {
          throw new TypeError(
            `Plugin API method "${path.map(String).join('.')}" is not callable.`
          );
        }

        return Reflect.apply(value, owner, args);
      },
      {
        get(target, key, receiver) {
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return;
          }
          if (key in target) {
            return Reflect.get(target, key, receiver);
          }

          return createApiFacade([...path, key]);
        },
      }
    );
  const api = new Proxy(Object.create(null) as Record<PropertyKey, unknown>, {
    get(_target, key) {
      if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
        return;
      }

      return createApiFacade([key]);
    },
  });
  const getRuntimeApi = () => {
    const plugin = getPlugin();

    if (isResolvingPlatePlugin(editor, plugin)) {
      return plugin.api &&
        typeof plugin.api === 'object' &&
        !Array.isArray(plugin.api)
        ? plugin.api
        : api;
    }
    if (
      !hasCompiledPlatePluginApiCandidate(editor) &&
      getCompiledPlatePluginApi(editor, plugin.name) === undefined
    ) {
      return api;
    }

    return getCompiledPlatePluginApi(editor, plugin.name) ?? {};
  };
  const createUpdateFacade = (path: readonly PropertyKey[]): unknown =>
    new Proxy(
      (...args: unknown[]) => {
        let result: unknown;

        const update = Reflect.get(editor, 'update');

        if (typeof update !== 'function') {
          throw new TypeError('Plate editor update API is not callable.');
        }
        Reflect.apply(update, editor, [
          (transaction: Record<PropertyKey, unknown>) => {
            const ownGroup = transaction[getPlugin().name];
            const resolve = (source: unknown) => {
              let owner: unknown = source;
              let value: unknown = source;

              for (const key of path) {
                owner = value;
                value =
                  value &&
                  (typeof value === 'object' || typeof value === 'function')
                    ? (value as Record<PropertyKey, unknown>)[key]
                    : undefined;
              }

              return { owner, value };
            };
            const own = resolve(ownGroup);
            const { owner, value } =
              typeof own?.value === 'function' ? own : resolve(transaction);

            if (typeof value !== 'function') {
              throw new TypeError(
                `Plugin update command "${path.map(String).join('.')}" is not callable.`
              );
            }

            result = Reflect.apply(value, owner, args);
          },
        ]);

        return result;
      },
      {
        get(target, key, receiver) {
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return;
          }
          if (key in target) {
            return Reflect.get(target, key, receiver);
          }

          return createUpdateFacade([...path, key]);
        },
      }
    );
  const createReadFacade = (path: readonly PropertyKey[]): unknown =>
    new Proxy(
      (...args: unknown[]) => {
        const editorRead = Reflect.get(editor, 'read');
        let owner: unknown =
          editorRead &&
          (typeof editorRead === 'object' || typeof editorRead === 'function')
            ? Reflect.get(editorRead, getPlugin().name)
            : undefined;
        let value = owner;

        for (const key of path) {
          owner = value;
          value =
            value && (typeof value === 'object' || typeof value === 'function')
              ? (value as Record<PropertyKey, unknown>)[key]
              : undefined;
        }

        if (typeof value !== 'function') {
          throw new TypeError(
            `Plugin read method "${path.map(String).join('.')}" is not callable.`
          );
        }

        return Reflect.apply(value, owner, args);
      },
      {
        get(target, key, receiver) {
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return;
          }
          if (key in target) {
            return Reflect.get(target, key, receiver);
          }

          return createReadFacade([...path, key]);
        },
      }
    );
  const read = new Proxy(Object.create(null) as Record<PropertyKey, unknown>, {
    get(_target, key) {
      if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
        return;
      }

      return createReadFacade([key]);
    },
  });
  const update = new Proxy(
    Object.create(null) as Record<PropertyKey, unknown>,
    {
      get(_target, key) {
        if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
          return;
        }

        return createUpdateFacade([key]);
      },
    }
  );
  const store: PluginStore<AnyBasePluginDefinition> = Object.freeze({
    get(key?: PropertyKey, ...args: unknown[]) {
      const runtime = getStore();

      if (runtime) {
        return Reflect.apply(runtime.public.get, runtime.public, [
          key,
          ...args,
        ]);
      }
      const plugin = getPlugin();

      if (key === undefined) return plugin.initialState;
      const selector = Reflect.get(plugin.selectors, key);

      if (typeof selector === 'function') {
        return Reflect.apply(selector, plugin.selectors, [
          plugin.initialState,
          ...args,
        ]);
      }
      if (Object.hasOwn(plugin.initialState, key)) {
        return Reflect.get(plugin.initialState, key);
      }

      throw new Error(
        `Plate plugin "${plugin.name}" has no state field or selector "${String(key)}".`
      );
    },
    set(value: unknown) {
      const runtime = getStore();

      if (runtime) {
        Reflect.apply(runtime.public.set, runtime.public, [value]);
      }
    },
    subscribe(listener: (state: object, previousState: object) => void) {
      const runtime = getStore();

      return runtime
        ? Reflect.apply(runtime.public.subscribe, runtime.public, [listener])
        : () => {};
    },
  }) as PluginStore<AnyBasePluginDefinition>;
  const context = {} as Record<PropertyKey, unknown>;

  if (authoring) {
    context.defineCodecs = createDefinePluginCodecs<AnyBasePluginDefinition>();
    context.editor = editor;
  }

  Object.defineProperties(context, {
    api: { enumerable: true, get: getRuntimeApi },
    installed: { enumerable: true, get: isInstalled },
    plugin: { enumerable: true, get: getPlugin },
    read: {
      enumerable: true,
      get: () => {
        getPlugin();

        return read;
      },
    },
    store: {
      enumerable: true,
      get: () => {
        getPlugin();

        return store;
      },
    },
    type: { enumerable: true, get: () => getPlugin().type },
    update: {
      enumerable: true,
      get: () => {
        getPlugin();

        return update;
      },
    },
  });

  return context as AnyBasePluginContext | AnyBasePluginPortal;
};
