import type {
  AnyPluginConfig,
  PluginConfig,
} from '../../lib/plugin/BasePlugin';
import type { PlateEditor } from './PlateEditor';
import type {
  EditorPlatePlugin,
  PlatePlugin,
  PlatePluginContext,
} from './PlatePlugin';

import { resolvePlugin } from '../../lib';

export function getPluginContext<C extends AnyPluginConfig = PluginConfig>(
  editor: PlateEditor,
  pluginOrKey: EditorPlatePlugin<C> | string
): PlatePluginContext<C> {
  const plugin =
    typeof pluginOrKey === 'string'
      ? editor.getPlugin<C>({ key: pluginOrKey } as any)
      : (pluginOrKey as any as PlatePlugin<C>).__resolved
        ? pluginOrKey
        : resolvePlugin(editor, pluginOrKey as any);

  return {
    api: editor.api,
    editor,
    options: plugin.options,
    plugin,
    transforms: editor.transforms,
    type: plugin.type,
  };
}
