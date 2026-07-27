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
import {
  createDefineEditorExtension,
  createDefinePluginCodecs,
} from './pluginAuthoringContext';
import {
  getCompiledPlatePlugin,
  getCompiledPlatePluginApi,
  hasCompiledPlatePluginCandidate,
  hasCompiledPlatePluginApiCandidate,
  isResolvingPlatePlugin,
} from '../../internal/plugin/compilePlateModel';
import { getPluginStore } from '../../internal/plugin/pluginStore';

export function getEditorPlugin<C extends AnyPluginConfig>(
  editor: BaseEditor,
  p: PluginReference & { readonly __config: C }
): BasePluginContext<C>;
export function getEditorPlugin<P extends AnyPluginConfig>(
  editor: BaseEditor,
  p: WithRequiredKey<P>
): BasePluginContext<InferConfig<P> extends never ? P : InferConfig<P>>;
export function getEditorPlugin(
  editor: BaseEditor,
  p: WithRequiredKey<AnyPluginConfig> | AnyBasePlugin
): BasePluginContext<any> {
  const provided = p as AnyBasePlugin;
  const getCandidate = () => {
    if (!provided.__resolved) return;
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

        editor.update((tx) => {
          const transaction = tx as unknown as Record<PropertyKey, unknown>;
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
        });

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
        let owner: unknown = (
          editor.read as unknown as Record<PropertyKey, unknown>
        )[getPlugin().key];
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
  const defineEditorExtension = createDefineEditorExtension<AnyPluginConfig>();
  const store: PluginStore<AnyPluginConfig> = Object.freeze({
    get(key?: PropertyKey, ...args: unknown[]) {
      const runtime = getStore();

      if (runtime) return (runtime.public.get as any)(key, ...args);
      const plugin = getPlugin();

      if (key === undefined) return plugin.initialState;
      const selector = (
        plugin.selectors as Record<
          PropertyKey,
          ((state: object, ...args: unknown[]) => unknown) | undefined
        >
      )[key] as ((state: object, ...args: unknown[]) => unknown) | undefined;

      if (selector) return selector(plugin.initialState, ...args);
      if (Object.hasOwn(plugin.initialState, key)) {
        return plugin.initialState[key as never];
      }

      throw new Error(
        `Plate plugin "${plugin.key}" has no state field or selector "${String(key)}".`
      );
    },
    set(value: unknown) {
      getStore()?.public.set(value as never);
    },
    subscribe(listener: (state: object, previousState: object) => void) {
      return getStore()?.public.subscribe(listener) ?? (() => {});
    },
  }) as PluginStore<AnyPluginConfig>;
  const context = {
    defineCodecs,
    defineEditorExtension,
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

  return context as BasePluginContext<any>;
}
