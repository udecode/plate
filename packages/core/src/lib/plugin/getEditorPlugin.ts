import type { BaseEditor } from '../editor';
import type {
  AnyPluginConfig,
  InferOptions,
  WithRequiredKey,
} from './SlatePlugin';
import type {
  AnyBasePlugin,
  BasePlugin,
  InferConfig,
  BasePluginContext,
} from './BasePlugin';

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
  const plugin = editor.getPlugin(p) as any;
  const getStore = () => editor.getOptionsStore(plugin);

  return {
    api: editor.api,
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
  };
}
