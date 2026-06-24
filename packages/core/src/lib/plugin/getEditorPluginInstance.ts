import type { BasePlateEditor } from '../editor';
import type {
  AnyPluginConfig,
  PluginConfig,
  WithRequiredKey,
} from './BasePlugin';
import type { AnyEditorPlugin, EditorPlugin } from './EditorPlugin';

import { resolvePlugin } from '../../internal/plugin/resolvePlugin';
import { createEditorPlugin } from './createEditorPlugin';

/** Get editor plugin by key or plugin object. */
export function getEditorPluginInstance<
  C extends AnyPluginConfig = PluginConfig,
>(
  editor: BasePlateEditor,
  p: WithRequiredKey<C>
): C extends { node: any } ? C : EditorPlugin<C> {
  let plugin = p as any;

  const editorPlugin = editor.plugins[p.key] as any;

  if (!editorPlugin) {
    // When passing only { key }
    if (!plugin.node) {
      plugin = createEditorPlugin(plugin);
    }

    // Resolve is need when passing an external plugin with extensions (e.g. in withLink)
    return plugin.__resolved ? plugin : resolvePlugin(editor, plugin);
  }

  return editorPlugin;
}

/** Get editor plugin type by key or plugin object. */
export function getPluginType(editor: BasePlateEditor, key: string): string {
  const p = editor.getPlugin<AnyEditorPlugin>({ key });

  return p.node.type ?? p.key ?? '';
}

/** Get editor plugin types by key. */
export const getPluginTypes = (editor: BasePlateEditor, keys: string[]) =>
  keys.map((key) => editor.getType(key));

export const getPluginKey = (
  editor: BasePlateEditor,
  type: string
): string | undefined => editor.meta.pluginCache.node.types[type];

export const getPluginKeys = (
  editor: BasePlateEditor,
  types: string[]
): string[] =>
  types
    .map((type) => {
      const pluginKey = getPluginKey(editor, type);
      return pluginKey ?? type;
    })
    .filter(Boolean);

export const getPluginByType = (editor: BasePlateEditor, type: string) => {
  const key = getPluginKey(editor, type);
  if (!key) return null;

  return editor.getPlugin({ key });
};

export const getContainerTypes = (editor: BasePlateEditor) =>
  getPluginTypes(editor, editor.meta.pluginCache.node.isContainer);
