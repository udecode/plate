import type { PlateEditor } from '../editor';
import type {
  AnyEditorPlugin,
  EditorPlugin,
  InferPluginApi,
  PluginKey,
} from './types/PlatePlugin';

import { createPlugin } from './createPlugin';

/** Get editor plugin by key or plugin object. */
export function getPlugin<O = {}, A = {}, T = {}, S = {}>(
  editor: PlateEditor,
  keyOrPlugin: EditorPlugin<O, A, T, S> | PluginKey
): EditorPlugin<O, A, T, S> {
  const key = typeof keyOrPlugin === 'string' ? keyOrPlugin : keyOrPlugin.key;

  return ((editor.plugins?.[key] as any) ??
    createPlugin({ key })) as EditorPlugin<O, A, T, S>;
}

/** Get editor plugin options by key or plugin object. */
export function getPluginOptions<O = any>(
  editor: PlateEditor,
  keyOrPlugin: EditorPlugin<O, any, any, any> | PluginKey
): O {
  const plugin = getPlugin(editor, keyOrPlugin);

  return plugin.options as O;
}

/** Get editor plugin type by key or plugin object. */
export function getPluginType(
  editor: PlateEditor,
  keyOrPlugin: AnyEditorPlugin | PluginKey
): string {
  const plugin = getPlugin(editor, keyOrPlugin);

  return plugin.type ?? plugin.key ?? '';
}

/** Get editor plugin types by key. */
export const getPluginTypes = (editor: PlateEditor, keys: PluginKey[]) =>
  keys.map((key) => getPluginType(editor, key));

export function getPluginApi<P extends AnyEditorPlugin>(
  editor: PlateEditor,
  plugin: P
): InferPluginApi<P> {
  return getPlugin(editor, plugin).api as InferPluginApi<P>;
}

export function getEditorApi<P extends AnyEditorPlugin>(
  editor: PlateEditor,
  _plugin: P
): InferPluginApi<P> {
  return editor.api as InferPluginApi<P>;
}
