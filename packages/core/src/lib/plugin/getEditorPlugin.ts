import type { BaseEditor } from '../editor';
import type {
  AnyPluginConfig,
  InferApi,
  InferOwnApi,
  InferOptions,
  WithRequiredKey,
} from './PluginConfig';
import type {
  AnyBasePlugin,
  BasePlugin,
  BasePluginContext,
  InferConfig,
  PlatePluginTxGroup,
} from './BasePlugin';

type PluginUpdateGroup = (...args: Parameters<PlatePluginTxGroup>) => unknown;

const isPluginUpdateGroup = (value: unknown): value is PluginUpdateGroup =>
  typeof value === 'function';

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
  const plugin = editor.getPlugin(p) as AnyBasePlugin;
  const getStore = () => editor.getOptionsStore(plugin);
  const getApi = () => {
    const pluginApi = plugin.api ?? {};
    const keyedApi = pluginApi[plugin.key];

    if (keyedApi && typeof keyedApi === 'object') {
      const { [plugin.key]: _pluginSpecificApi, ...editorLevelApi } = pluginApi;

      return {
        ...editorLevelApi,
        ...keyedApi,
      } satisfies InferOwnApi<AnyPluginConfig>;
    }

    return pluginApi as InferApi<AnyPluginConfig>;
  };
  const getUpdate = () => {
    let groupFactories: Map<string, PluginUpdateGroup[]> | undefined;

    const getGroupFactories = () => {
      if (groupFactories) return groupFactories;

      groupFactories = new Map();
      const addFactory = (groupKey: string, factory: PluginUpdateGroup) => {
        const factories = groupFactories!.get(groupKey) ?? [];

        factories.push(factory);
        groupFactories!.set(groupKey, factories);
      };

      plugin.__txExtensions.forEach((extension) => {
        Object.entries(extension(getEditorPlugin(editor, plugin))).forEach(
          ([groupKey, factory]) => {
            if (factory) addFactory(groupKey, factory);
          }
        );
      });
      Object.entries(plugin.tx ?? {}).forEach(([groupKey, factory]) => {
        if (factory) addFactory(groupKey, factory);
      });
      plugin.__editorExtensions.forEach((extendEditor) => {
        const input = extendEditor(getEditorPlugin(editor, plugin));

        if (!input) return;

        const extensions = Array.isArray(input) ? input : [input];

        extensions.forEach((extension) => {
          Object.entries(extension.tx ?? {}).forEach(([groupKey, factory]) => {
            if (isPluginUpdateGroup(factory)) addFactory(groupKey, factory);
          });
        });
      });

      return groupFactories;
    };

    const runCommand = (
      groupKey: string,
      path: readonly PropertyKey[],
      args: unknown[]
    ) => {
      let result: unknown;

      editor.update((tx, context) => {
        const group = Object.create(null) as Record<PropertyKey, unknown>;

        getGroupFactories()
          .get(groupKey)
          ?.forEach((factory) => {
            const commands = factory(tx, editor, context);

            if (commands && typeof commands === 'object') {
              Object.assign(group, commands);
            }
          });

        const command = path.reduce<unknown>(
          (value, key) =>
            value && typeof value === 'object'
              ? (value as Record<PropertyKey, unknown>)[key]
              : undefined,
          group
        );

        if (typeof command !== 'function') {
          throw new TypeError(
            `Plugin update command "${groupKey}.${path.join('.')}" is not callable.`
          );
        }

        result = command(...args);
      });

      return result;
    };

    const createCommand = (groupKey: string, path: readonly PropertyKey[]) =>
      new Proxy((...args: unknown[]) => runCommand(groupKey, path, args), {
        get(_target, key) {
          return createCommand(groupKey, [...path, key]);
        },
      });

    return new Proxy(Object.create(null) as Record<PropertyKey, unknown>, {
      get(_target, key) {
        if (
          typeof key === 'string' &&
          key !== plugin.key &&
          getGroupFactories().has(key)
        ) {
          return new Proxy(Object.create(null), {
            get(_groupTarget, methodName) {
              return createCommand(key, [methodName]);
            },
          });
        }

        return createCommand(plugin.key, [key]);
      },
    });
  };

  return {
    api: getApi(),
    editor,
    plugin: plugin as any,
    setOption: ((key: keyof InferOptions<AnyPluginConfig>, value: unknown) => {
      const store = getStore();

      if (!store) return;

      const state = store.get('state') as object;

      if (!(key in state)) {
        editor.api.debug.error(
          `plugin.setOption: ${String(key)} option is not defined in plugin ${plugin.key}.`,
          'OPTION_UNDEFINED'
        );
        return;
      }

      store.set(key as never, value as never);
    }) as any,
    setOptions: ((options: unknown) => {
      const store = getStore();

      if (!store) return;

      if (typeof options === 'function') {
        store.set('state', options as never);
      } else if (typeof options === 'object' && options !== null) {
        store.set('state', (draft: object) => {
          Object.assign(draft, options);
        });
      }
    }) as any,
    type: plugin.node?.type ?? plugin.key,
    getOption: ((key: PropertyKey, ...args: unknown[]) => {
      const store = getStore() as any;

      if (!store) return plugin.options[key as never];

      if (!(key in store.get('state')) && !(key in store.selectors)) {
        editor.api.debug.error(
          `plugin.getOption: ${String(key)} option is not defined in plugin ${plugin.key}.`,
          'OPTION_UNDEFINED'
        );
        return;
      }

      return store.get(key, ...args);
    }) as any,
    getOptions: (() => {
      const store = getStore();

      if (!store) return plugin.options;

      return store.get('state');
    }) as any,
    update: getUpdate(),
  };
}
