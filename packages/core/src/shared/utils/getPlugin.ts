import type { PlateEditor } from '../types/PlateEditor';
import type {
  AnyEditorPlugin,
  EditorPlugin,
  PlatePlugin,
  PluginKey,
} from '../types/plugin/PlatePlugin';

import { createPlugin } from './createPlugin';

export type InferPluginOptions<P> =
  P extends PlatePlugin<any, infer O, any, any, any> ? O : never;

export type InferPluginApi<P> =
  P extends PlatePlugin<any, any, infer A, any, any> ? A : never;

export type InferPluginTransforms<P> =
  P extends PlatePlugin<any, any, any, infer T, any> ? T : never;

/** Get editor plugin by key or plugin object. */
export function getPlugin<O = {}, A = {}, T = {}, S = {}>(
  editor: PlateEditor,
  keyOrPlugin: EditorPlugin<O, A, T, S> | PluginKey
): EditorPlugin<O, A, T, S> {
  const key = typeof keyOrPlugin === 'string' ? keyOrPlugin : keyOrPlugin.key;

  return ((editor.pluginsByKey?.[key] as any) ??
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

// export function getPluginApi<P extends EditorPlugin< any, any, any>>(
//   editor: PlateEditor,
//   plugin: P
// ): InferPluginApi<P> {
//   return editor.api[plugin.key] as InferPluginApi<P>;
// }

// const a = createPlugin({
//   api: {
//     fn: (a: number) => {
//       return a;
//     },
//   },
//   key: 'a',
// });
//
// const api = getPluginApi(createPlateEditor(), a);
//
// type MyPlugin = typeof LengthPlugin | typeof ReactPlugin | typeof a;
// // ... other plugins
//
// type MyEditorApi = {
//   [K in MyPlugin['key']]: InferPluginApi<Extract<MyPlugin, { key: K }>>;
// };
//
// type MyEditor = PlateEditor<Value, MyEditorApi>;
//
// // Usage
// const myEditor = createPlateEditor<MyEditor>({
//   plugins: [LengthPlugin, ReactPlugin, a /* ... other plugins */],
// });
// myEditor;
//
// // // Now you can use it like this:
// myEditor.api.a.fn(1);
