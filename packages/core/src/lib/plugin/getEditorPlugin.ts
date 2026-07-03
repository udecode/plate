import type { BaseEditor } from '../editor';
import type { AnyPluginConfig, WithRequiredKey } from './SlatePlugin';
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

  return {
    api: editor.api,
    editor,
    plugin: plugin as any,
    setOption: ((keyOrOptions: any, value: any) =>
      (editor.setOption as (...args: any[]) => void)(
        plugin,
        keyOrOptions,
        value
      )) as any,
    setOptions: ((options: any) =>
      (editor.setOptions as (...args: any[]) => void)(plugin, options)) as any,
    type: plugin.node.type,
    getOption: (key: any, ...args: any) =>
      (editor.getOption as any)(plugin, key, ...args),
    getOptions: () => editor.getOptions(plugin),
  };
}
