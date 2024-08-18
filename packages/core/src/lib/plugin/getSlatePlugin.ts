import type { SlateEditor } from '../editor';
import type { AnyPluginConfig, WithRequiredKey } from './BasePlugin';
import type { EditorPlugin } from './SlatePlugin';

import { createSlatePlugin } from './createSlatePlugin';

/** Get editor plugin by key or plugin object. */
export function getSlatePlugin<C extends AnyPluginConfig = AnyPluginConfig>(
  editor: SlateEditor,
  plugin: WithRequiredKey<C>
): EditorPlugin<C> {
  return (
    (editor.plugins[plugin.key] as any) ??
    createSlatePlugin({ key: plugin.key })
  );
}

/** Get editor plugin type by key or plugin object. */
export function getPluginType(
  editor: SlateEditor,
  plugin: WithRequiredKey
): string {
  const p = editor.getPlugin(plugin);

  return p.type ?? p.key ?? '';
}

/** Get editor plugin types by key. */
export const getPluginTypes = (editor: SlateEditor, keys: string[]) =>
  keys.map((key) => editor.getType({ key }));
