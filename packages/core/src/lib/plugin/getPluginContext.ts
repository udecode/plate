import type { SlateEditor } from '../editor';
import type { AnyPluginConfig, WithRequiredKey } from './BasePlugin';
import type {
  InferConfig,
  SlatePlugin,
  SlatePluginContext,
} from './SlatePlugin';

import { resolvePlugin } from '../utils';

export function getPluginContext<
  P extends AnyPluginConfig | SlatePlugin<AnyPluginConfig>,
>(
  editor: SlateEditor,
  plugin: WithRequiredKey<P>
): SlatePluginContext<InferConfig<P> extends never ? P : InferConfig<P>> {
  const editorPlugin = (plugin as any).options
    ? (plugin as any).__resolved
      ? plugin
      : resolvePlugin(editor, plugin as any)
    : editor.getPlugin({ key: plugin.key } as any);

  return {
    api: editor.api as any,
    editor,
    options: editorPlugin.options,
    plugin: editorPlugin,
    transforms: editor.transforms as any,
    type: editorPlugin.type,
  };
}
