import type { PlateEditor } from '../editor';
import type {
  AnyPluginConfig,
  EditorPlugin,
  EditorPluginContext,
  PlatePlugin,
  PluginConfig,
} from './types';

import { resolvePlugin } from '../utils';

export function getPluginContext<C extends AnyPluginConfig = PluginConfig>(
  editor: PlateEditor,
  pluginOrKey: EditorPlugin<C> | string
): EditorPluginContext<C> {
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
