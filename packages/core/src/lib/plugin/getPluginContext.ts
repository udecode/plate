import type { PlateEditor } from '../editor';
import type {
  AnyPluginConfig,
  EditorPlugin,
  EditorPluginContext,
  PluginConfig,
} from './types';

export function getPluginContext<C extends AnyPluginConfig = PluginConfig>(
  editor: PlateEditor,
  plugin: EditorPlugin<C>
): EditorPluginContext<C> {
  return {
    api: editor.api,
    editor,
    options: plugin.options,
    plugin,
    transforms: editor.transforms,
    type: plugin.type,
  };
}
