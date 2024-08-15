import type { PlateEditor } from '../editor';
import type {
  AnyPluginConfig,
  EditorPlugin,
  WithRequiredKey,
} from './types/PlatePlugin';

import { createPlugin } from './createPlugin';

/** Get editor plugin by key or plugin object. */
export function getPlugin<C extends AnyPluginConfig = AnyPluginConfig>(
  editor: PlateEditor,
  plugin: WithRequiredKey<C>
): EditorPlugin<C> {
  return (
    (editor.plugins?.[plugin.key] as any) ?? createPlugin({ key: plugin.key })
  );
}

/** Get editor plugin type by key or plugin object. */
export function getPluginType(
  editor: PlateEditor,
  plugin: WithRequiredKey
): string {
  const p = editor.getPlugin(plugin);

  return p.type ?? p.key ?? '';
}

/** Get editor plugin types by key. */
export const getPluginTypes = (editor: PlateEditor, keys: string[]) =>
  keys.map((key) => editor.getType({ key }));
