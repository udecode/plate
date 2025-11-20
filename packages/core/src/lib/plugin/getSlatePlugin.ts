import type { SlateEditor } from '../editor';
import type {
  AnyPluginConfig,
  PluginConfig,
  WithRequiredKey,
} from './BasePlugin';
import type { AnySlatePlugin, SlatePlugin } from './SlatePlugin';

import { resolvePlugin } from '../../internal/plugin/resolvePlugin';
import { createSlatePlugin } from './createSlatePlugin';

/** Get editor plugin by key or plugin object. */
export function getSlatePlugin<C extends AnyPluginConfig = PluginConfig>(
  editor: SlateEditor,
  p: WithRequiredKey<C>
): C extends { node: any } ? C : SlatePlugin<C> {
  let plugin = p as any;

  const editorPlugin = editor.plugins[p.key] as any;

  if (!editorPlugin) {
    // When passing only { key }
    if (!plugin.node) {
      plugin = createSlatePlugin(plugin);
    }

    // Resolve is need when passing an external plugin with extensions (e.g. in withLink)
    return plugin.__resolved ? plugin : resolvePlugin(editor, plugin);
  }

  return editorPlugin;
}

/** Get editor plugin type by key or plugin object. */
export function getPluginType(editor: SlateEditor, key: string): string {
  const p = editor.getPlugin<AnySlatePlugin>({ key });

  return p.node.type ?? p.key ?? '';
}

/** Get editor plugin types by key. */
export const getPluginTypes = (editor: SlateEditor, keys: string[]) =>
  keys.map((key) => editor.getType(key));

export const getPluginKey = (
  editor: SlateEditor,
  type: string
): string | undefined => editor.meta.pluginCache.node.types[type];

export const getPluginKeys = (editor: SlateEditor, types: string[]): string[] =>
  types
    .map((type) => {
      const pluginKey = getPluginKey(editor, type);
      return pluginKey ?? type;
    })
    .filter(Boolean);

export const getPluginByType = (editor: SlateEditor, type: string) => {
  const key = getPluginKey(editor, type);
  if (!key) return null;

  return editor.getPlugin({ key });
};

export const getContainerTypes = (editor: SlateEditor) =>
  getPluginTypes(editor, editor.meta.pluginCache.node.isContainer);
