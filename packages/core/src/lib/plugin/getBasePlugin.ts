import type { BaseEditor } from '../editor';
import type {
  AnyPluginConfig,
  PluginConfig,
  WithRequiredKey,
} from './PluginConfig';
import type { BasePlugin } from './BasePlugin';

import { resolvePlugin } from '../../internal/plugin/resolvePlugin';
import { createBasePlugin } from './createBasePlugin';

/** Get editor plugin by key or plugin object. */
export function getBasePlugin<C extends AnyPluginConfig = PluginConfig>(
  editor: BaseEditor,
  p: WithRequiredKey<C>
): C extends { node: any } ? C : BasePlugin<C> {
  let plugin = p as any;

  const editorPlugin = editor.plugins[p.key] as any;

  if (!editorPlugin) {
    // When passing only { key }
    if (!plugin.node) {
      plugin = createBasePlugin(plugin);
    }

    // Resolve when passing an external plugin with deferred plugin configuration.
    return plugin.__resolved ? plugin : resolvePlugin(editor, plugin);
  }

  return editorPlugin;
}

/** Get editor plugin type by key or plugin object. */
export function getPluginType(editor: BaseEditor, key: string): string {
  const plugin = editor.getPlugin({ key });

  return plugin.node.type ?? plugin.key ?? '';
}

/** Get editor plugin types by key. */
export const getPluginTypes = (editor: BaseEditor, keys: string[]) =>
  keys.map((key) => editor.getType(key));

export const getPluginKey = (
  editor: BaseEditor,
  type: string
): string | undefined => editor.runtime.pluginCache.node.types[type];

export const getPluginKeys = (editor: BaseEditor, types: string[]): string[] =>
  types
    .map((type) => {
      const pluginKey = getPluginKey(editor, type);
      return pluginKey ?? type;
    })
    .filter(Boolean);

export const getPluginByType = (editor: BaseEditor, type: string) => {
  const key = getPluginKey(editor, type);
  if (!key) return null;

  return editor.getPlugin({ key });
};

export const getContainerTypes = (editor: BaseEditor) =>
  getPluginTypes(editor, editor.runtime.pluginCache.node.isContainer);
