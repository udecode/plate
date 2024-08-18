import type {
  AnyPluginConfig,
  PluginConfig,
  WithRequiredKey,
} from '../../lib/plugin/BasePlugin';
import type { PlateEditor } from '../editor/PlateEditor';
import type { PlatePlugin, PlatePluginContext } from './PlatePlugin';

import { resolvePlugin } from '../../lib';

export function getPluginContext<C extends AnyPluginConfig = PluginConfig>(
  editor: PlateEditor,
  plugin: WithRequiredKey<C>
): PlatePluginContext<C> {
  const editorPlugin = (plugin as any).options
    ? (plugin as any as PlatePlugin<C>).__resolved
      ? plugin
      : resolvePlugin(editor, plugin as any)
    : editor.getPlugin<C>({ key: plugin } as any);

  return {
    api: editor.api as any,
    editor,
    options: editorPlugin.options,
    plugin: editorPlugin,
    transforms: editor.transforms as any,
    type: editorPlugin.type,
  };
}
