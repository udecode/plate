import type { SlateEditor } from '../editor';
import type { AnyPluginConfig, WithRequiredKey } from './BasePlugin';
import type {
  InferConfig,
  SlatePlugin,
  SlatePluginContext,
} from './SlatePlugin';

export function getEditorPlugin<
  P extends AnyPluginConfig | SlatePlugin<AnyPluginConfig>,
>(
  editor: SlateEditor,
  p: WithRequiredKey<P>
): SlatePluginContext<InferConfig<P> extends never ? P : InferConfig<P>> {
  const plugin = editor.getPlugin(p) as any;

  return {
    api: editor.api,
    editor,
    getOption: (key: any, ...args: any) =>
      editor.getOption(plugin, key, ...args),
    getOptions: () => editor.getOptions(plugin),
    plugin: plugin as any,
    setOption: ((keyOrOptions: any, value: any) =>
      editor.setOption(plugin, keyOrOptions, value)) as any,
    setOptions: ((options: any) => editor.setOptions(plugin, options)) as any,
    tf: editor.transforms,
    type: plugin.node.type,
  };
}
