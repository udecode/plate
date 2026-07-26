import { create } from 'mutative';

import type { BaseEditor } from '../editor';
import type {
  AnyPluginConfig,
  InferOptions,
  WithRequiredKey,
} from './PluginConfig';
import type {
  AnyBasePlugin,
  BasePlugin,
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
import {
  getPluginOptionsStore,
  snapshotPluginOptions,
} from '../../internal/plugin/pluginOptionsStore';

export function getEditorPlugin<C extends AnyPluginConfig>(
  editor: BaseEditor,
  p: BasePlugin<C>
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
  const getStore = () => getPluginOptionsStore(editor, getPlugin().key);
  const replaceStoreState = (
    store: NonNullable<ReturnType<typeof getStore>>,
    value: object
  ) => {
    store.set('state', snapshotPluginOptions(value) as never);
  };
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
        get(_target, key) {
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return;
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
        get(_target, key) {
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return;
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
        get(_target, key) {
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return;
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
  const context = {
    defineCodecs,
    defineEditorExtension,
    editor,
    setOption: ((key: keyof InferOptions<AnyPluginConfig>, value: unknown) => {
      const plugin = getPlugin();
      const store = getStore();

      if (!store) return;

      const state = store.get('state') as object;

      if (!(key in state)) {
        editor.api.debug.error(
          `plugin.setOption: ${String(key)} option is not defined in plugin ${
            plugin.key
          }.`,
          'OPTION_UNDEFINED'
        );
        return;
      }

      replaceStoreState(store, {
        ...(state as Record<PropertyKey, unknown>),
        [key]: value,
      });
    }) as any,
    setOptions: ((options: unknown) => {
      const store = getStore();

      if (!store) return;

      if (typeof options === 'function') {
        const next = create(store.get('state') as object, options as never);

        replaceStoreState(store, next);
      } else if (typeof options === 'object' && options !== null) {
        replaceStoreState(store, {
          ...(store.get('state') as Record<PropertyKey, unknown>),
          ...options,
        });
      }
    }) as any,
    getOption: ((key: PropertyKey, ...args: unknown[]) => {
      const plugin = getPlugin();
      const store = getStore() as any;

      if (!store) return plugin.options[key as never];

      if (!(key in store.get('state')) && !(key in store.selectors)) {
        editor.api.debug.error(
          `plugin.getOption: ${String(key)} option is not defined in plugin ${
            plugin.key
          }.`,
          'OPTION_UNDEFINED'
        );
        return;
      }

      return store.get(key, ...args);
    }) as any,
    getOptions: (() => {
      const plugin = getPlugin();
      const store = getStore();

      if (!store) return plugin.options;

      return store.get('state');
    }) as any,
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
