import type { Value } from '@platejs/plite';

import type { BaseEditor } from '../editor';
import type {
  AnyPluginConfig,
  PluginReference,
  PluginStore,
  WithRequiredKey,
} from './PluginConfig';
import type {
  AnyBasePlugin,
  BasePluginContext,
  InferConfig,
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
import { isNominalPluginDescriptor } from '../../internal/utils/mergePlugins';

const isResolvedBasePluginDescriptor = (
  value: unknown
): value is AnyBasePlugin =>
  isNominalPluginDescriptor(value) && Reflect.get(value, '__resolved') === true;

export function getEditorPlugin<
  V extends Value,
  E extends AnyPluginConfig,
  C extends AnyPluginConfig,
>(
  editor: BaseEditor<V, E>,
  p: PluginReference & { readonly __config: C }
): BasePluginContext<C>;
export function getEditorPlugin<
  V extends Value,
  E extends AnyPluginConfig,
  P extends AnyPluginConfig,
>(
  editor: BaseEditor<V, E>,
  p: WithRequiredKey<P>
): BasePluginContext<InferConfig<P> extends never ? P : InferConfig<P>>;
export function getEditorPlugin(
  editor: object,
  p: Readonly<{ key: string }>
): unknown {
  const provided = isResolvedBasePluginDescriptor(p) ? p : undefined;
  const getCandidate = () => {
    if (!provided) return;
    if (isResolvingPlatePlugin(editor, provided)) return provided;
    if (!hasCompiledPlatePluginCandidate(editor)) return;
    const compiled = getCompiledPlatePlugin(editor, p.key);

    if (provided === compiled) return provided;
  };
  const getPlugin = () => {
    const plugin = getCandidate() ?? getCompiledPlatePlugin(editor, p.key);

    if (!plugin) {
      throw new Error(`Plate plugin "${p.key}" is not installed.`);
    }

    return plugin;
  };
  const isInstalled = () =>
    getCandidate() !== undefined ||
    getCompiledPlatePlugin(editor, p.key) !== undefined;
  const getStore = () => getPluginStore(editor, getPlugin().key);
  const createApiFacade = (path: readonly PropertyKey[]): unknown =>
    new Proxy(
      (...args: unknown[]) => {
        let owner: unknown =
          getCompiledPlatePluginApi(editor, getPlugin().key) ?? {};
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

    if (
      !hasCompiledPlatePluginApiCandidate(editor) &&
      (isResolvingPlatePlugin(editor, plugin) ||
        getCompiledPlatePluginApi(editor, plugin.key) === undefined)
    ) {
      return api;
    }

    return getCompiledPlatePluginApi(editor, plugin.key) ?? {};
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
            const ownGroup = transaction[getPlugin().key];
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
            ? Reflect.get(editorRead, getPlugin().key)
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
  const defineCodecs = createDefinePluginCodecs<AnyPluginConfig>();
  const store: PluginStore<AnyPluginConfig> = Object.freeze({
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
        `Plate plugin "${plugin.key}" has no state field or selector "${String(key)}".`
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
  }) as PluginStore<AnyPluginConfig>;
  const context = {
    defineCodecs,
    editor,
    store,
  } as Record<PropertyKey, unknown>;

  Object.defineProperties(context, {
    api: { enumerable: true, get: getRuntimeApi },
    installed: { enumerable: true, get: isInstalled },
    plugin: { enumerable: true, get: getPlugin },
    read: { enumerable: true, value: read },
    type: { enumerable: true, get: () => getPlugin().type },
    update: { enumerable: true, value: update },
  });

  return context as BasePluginContext<AnyPluginConfig>;
}
