import type { SlateEditor } from '../editor';
import type {
  AnyPluginConfig,
  PluginConfig,
  WithRequiredKey,
} from './BasePlugin';
import type { AnySlatePlugin, SlatePlugin } from './SlatePlugin';

import { resolvePlugin } from '../utils';

/** Get editor plugin by key or plugin object. */
export function getSlatePlugin<C extends AnyPluginConfig = PluginConfig>(
  editor: SlateEditor,
  p: WithRequiredKey<C>
): C extends { node: any } ? C : SlatePlugin<C> {
  const plugin = p as any;

  const editorPlugin = editor.plugins[p.key] as any;

  if (!editorPlugin) {
    return plugin.__resolved ? p : resolvePlugin(editor, plugin);
  }

  return editorPlugin;
}

/** Get editor plugin type by key or plugin object. */
export function getPluginType(
  editor: SlateEditor,
  plugin: WithRequiredKey
): string {
  const p = editor.getPlugin<AnySlatePlugin>(plugin);

  return p.node.type ?? p.key ?? '';
}

/** Get editor plugin types by key. */
export const getPluginTypes = (
  editor: SlateEditor,
  plugins: WithRequiredKey[]
) => plugins.map((plugin) => editor.getType(plugin));
