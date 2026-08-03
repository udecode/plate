import type { Value } from '@platejs/plite';

import type {
  BaseEditor,
  InternalBaseEditorWithInstalledPlugins,
} from '../editor';
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
  AnyPluginBase,
  BasePluginContext,
  BasePluginPortal,
} from './BasePlugin';
import { createDefinePluginCodecs } from './pluginAuthoringContext';
import {
  getCompiledPlatePlugin,
  getCompiledPlatePluginApi,
  getCompiledPlateModelBinding,
  hasCompiledPlatePluginCandidate,
  hasCompiledPlatePluginApiCandidate,
  isResolvingPlatePlugin,
  resolvePluginElementType,
  resolvePluginPropertyKey,
} from '../../internal/plugin/compilePlateModel';
import { getPluginStore } from '../../internal/plugin/pluginStore';
import {
  getPluginSchemaFamily,
  isNominalPluginDescriptor,
  isResolvedPluginDescriptor,
} from '../../internal/utils/mergePlugins';

const isPluginBaseDescriptor = (value: unknown): value is AnyBasePlugin =>
  isNominalPluginDescriptor(value) && isResolvedPluginDescriptor(value);

export function createPluginPortal<
  V extends Value,
  E extends AnyBasePluginDefinition,
  P extends (AnyBasePlugin | AnyPluginBase) & PluginReference,
>(
  editor: InternalBaseEditorWithInstalledPlugins<V, E>,
  p: P
): BasePluginPortal<InternalPluginDefinitionOf<P>>;
export function createPluginPortal(
  editor: BaseEditor,
  plugin: AnyBasePlugin | AnyPluginBase | PluginReference | string
): AnyBasePluginPortal;
export function createPluginPortal(
  editor: object,
  plugin: AnyBasePlugin | AnyPluginBase | PluginReference | string
): unknown {
  return createPluginAccess(editor, plugin, false);
}

export function createPluginContext<
  V extends Value,
  E extends AnyBasePluginDefinition,
  P extends (AnyBasePlugin | AnyPluginBase) & PluginReference,
>(
  editor: InternalBaseEditorWithInstalledPlugins<V, E>,
  p: P
): BasePluginContext<InternalPluginDefinitionOf<P>>;
export function createPluginContext(
  editor: BaseEditor,
  plugin: AnyBasePlugin | AnyPluginBase | PluginReference | string
): AnyBasePluginContext;
export function createPluginContext(
  editor: object,
  plugin: AnyBasePlugin | AnyPluginBase | PluginReference | string
): unknown {
  return createPluginAccess(editor, plugin, true);
}

const createPluginAccess = (
  editor: object,
  input: AnyBasePlugin | AnyPluginBase | PluginReference | string,
  authoring: boolean
): AnyBasePluginContext | AnyBasePluginPortal => {
  if (typeof input !== 'string' && !isNominalPluginDescriptor(input)) {
    throw new TypeError(
      'Plate plugin lookup requires a plugin descriptor or plugin name string.'
    );
  }

  const descriptor = typeof input === 'string' ? undefined : input;
  const name = typeof input === 'string' ? input : input.name;
  const fallbackSchemaOwner =
    descriptor && 'schema' in descriptor
      ? (descriptor as AnyBasePlugin)
      : undefined;
  const provided =
    descriptor && isPluginBaseDescriptor(descriptor) ? descriptor : undefined;
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
  const getStore = () => getPluginStore(editor, getPlugin());
  const getElementType = () => {
    const plugin = getCandidate() ?? getCompiledPlatePlugin(editor, name);

    if (!plugin || !matchesDescriptorFamily(plugin)) {
      if (!descriptor) return name;
      if (
        fallbackSchemaOwner?.schema &&
        (typeof fallbackSchemaOwner.schema === 'function' ||
          (typeof fallbackSchemaOwner.schema === 'object' &&
            'element' in fallbackSchemaOwner.schema))
      ) {
        return resolvePluginElementType(fallbackSchemaOwner);
      }

      throw new Error(`Plate plugin "${name}" does not own an element type.`);
    }
    const binding = getCompiledPlateModelBinding(editor, plugin);

    if (binding) {
      if (binding.elementType) return binding.elementType;

      throw new Error(
        `Plate plugin "${plugin.name}" does not own an element type.`
      );
    }
    if (
      plugin.schema &&
      (typeof plugin.schema === 'function' ||
        (typeof plugin.schema === 'object' && 'element' in plugin.schema))
    ) {
      return resolvePluginElementType(plugin);
    }

    throw new Error(
      `Plate plugin "${plugin.name}" does not own an element type.`
    );
  };
  const getPropertyKey = () => {
    const plugin = getCandidate() ?? getCompiledPlatePlugin(editor, name);

    if (!plugin || !matchesDescriptorFamily(plugin)) {
      if (!descriptor) return name;
      if (
        fallbackSchemaOwner?.schema &&
        (typeof fallbackSchemaOwner.schema === 'function' ||
          (typeof fallbackSchemaOwner.schema === 'object' &&
            ('mark' in fallbackSchemaOwner.schema ||
              'properties' in fallbackSchemaOwner.schema)))
      ) {
        return resolvePluginPropertyKey(fallbackSchemaOwner);
      }

      throw new Error(`Plate plugin "${name}" does not own a property key.`);
    }
    const binding = getCompiledPlateModelBinding(editor, plugin);

    if (binding) {
      if (binding.propertyKey) return binding.propertyKey;

      throw new Error(
        `Plate plugin "${plugin.name}" does not own a property key.`
      );
    }
    if (
      plugin.schema &&
      (typeof plugin.schema === 'function' ||
        (typeof plugin.schema === 'object' &&
          ('mark' in plugin.schema || 'properties' in plugin.schema)))
    ) {
      return resolvePluginPropertyKey(plugin);
    }

    throw new Error(
      `Plate plugin "${plugin.name}" does not own a property key.`
    );
  };
  const createApiFacade = (path: readonly PropertyKey[]): unknown =>
    new Proxy(
      (...args: unknown[]) => {
        let owner: unknown =
          getCompiledPlatePluginApi(editor, getPlugin()) ?? {};
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
      getCompiledPlatePluginApi(editor, plugin) === undefined
    ) {
      return api;
    }

    return getCompiledPlatePluginApi(editor, plugin) ?? {};
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
    Object.defineProperty(context, 'plugin', {
      enumerable: true,
      get: getPlugin,
    });
  }

  Object.defineProperties(context, {
    api: { enumerable: true, get: getRuntimeApi },
    installed: { enumerable: true, get: isInstalled },
    key: { enumerable: false, get: getPropertyKey },
    name: { enumerable: true, get: () => getPlugin().name },
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
    type: { enumerable: false, get: getElementType },
    update: {
      enumerable: true,
      get: () => {
        getPlugin();

        return update;
      },
    },
  });

  return new Proxy(context, {
    get(target, key, receiver) {
      if (Reflect.has(target, key)) {
        return Reflect.get(target, key, receiver);
      }

      return Reflect.get(getPlugin(), key);
    },
    getOwnPropertyDescriptor(target, key) {
      const ownDescriptor = Reflect.getOwnPropertyDescriptor(target, key);

      if (ownDescriptor) return ownDescriptor;

      const pluginDescriptor = Reflect.getOwnPropertyDescriptor(
        getPlugin(),
        key
      );

      return pluginDescriptor
        ? { ...pluginDescriptor, configurable: true }
        : undefined;
    },
    has(target, key) {
      return Reflect.has(target, key) || Reflect.has(getPlugin(), key);
    },
    ownKeys(target) {
      return [
        ...new Set([
          ...Reflect.ownKeys(target),
          ...Reflect.ownKeys(getPlugin()),
        ]),
      ];
    },
    defineProperty(target, key, attributes) {
      return authoring
        ? Reflect.defineProperty(target, key, attributes)
        : false;
    },
    deleteProperty(target, key) {
      return authoring ? Reflect.deleteProperty(target, key) : false;
    },
    set(target, key, value, receiver) {
      return authoring ? Reflect.set(target, key, value, receiver) : false;
    },
  }) as AnyBasePluginContext | AnyBasePluginPortal;
};
