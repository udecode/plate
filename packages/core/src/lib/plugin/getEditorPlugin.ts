import type { BasePlateEditor } from '../editor';
import type { AnyPluginConfig, WithRequiredKey } from './BasePlugin';
import type {
  InferConfig,
  EditorPlugin,
  EditorPluginContext,
} from './EditorPlugin';

export function getEditorPlugin<
  P extends AnyPluginConfig | EditorPlugin<AnyPluginConfig>,
>(
  editor: BasePlateEditor,
  p: WithRequiredKey<P>
): EditorPluginContext<InferConfig<P> extends never ? P : InferConfig<P>> {
  const plugin = editor.getPlugin(p) as any;

  return {
    api: editor.api,
    editor,
    plugin: plugin as any,
    setOption: ((keyOrOptions: any, value: any) =>
      editor.setOption(plugin, keyOrOptions, value)) as any,
    setOptions: ((options: any) => editor.setOptions(plugin, options)) as any,
    type: plugin.node.type,
    getOption: (key: any, ...args: any) =>
      (editor.getOption as any)(plugin, key, ...args),
    getOptions: () => editor.getOptions(plugin),
  };
}
