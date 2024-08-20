import type { AnyPluginConfig, WithRequiredKey } from '../../lib';
import type { PlateEditor } from '../editor';
import type {
  InferConfig,
  PlatePlugin,
  PlatePluginContext,
} from './PlatePlugin';

import { resolvePlugin } from '../../lib';

export function getPluginContext<
  P extends AnyPluginConfig | PlatePlugin<AnyPluginConfig>,
>(
  editor: PlateEditor,
  plugin: WithRequiredKey<P>
): PlatePluginContext<InferConfig<P> extends never ? P : InferConfig<P>> {
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
