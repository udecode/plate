import type { SlateEditor } from '../editor';
import type { AnyPluginConfig, PluginConfig } from './BasePlugin';
import type {
  EditorPlugin,
  SlatePlugin,
  SlatePluginContext,
} from './SlatePlugin';

import { resolvePlugin } from '../utils';

export function getPluginContext<C extends AnyPluginConfig = PluginConfig>(
  editor: SlateEditor,
  pluginOrKey: EditorPlugin<C> | string
): SlatePluginContext<C> {
  const plugin =
    typeof pluginOrKey === 'string'
      ? editor.getPlugin<C>({ key: pluginOrKey } as any)
      : (pluginOrKey as any as SlatePlugin<C>).__resolved
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
