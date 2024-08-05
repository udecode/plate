import type { PlateEditor, PlatePlugin } from '../types';

export type InferPluginApi<P> =
  P extends PlatePlugin<any, infer C, any, any> ? C : never;

export function getPluginApi<P extends PlatePlugin<any, any, any, any>>(
  editor: PlateEditor,
  plugin: P
): InferPluginApi<P> {
  return editor.api[plugin.key] as InferPluginApi<P>;
}

// const a = createPlugin({
//   api: {
//     fn: (a: number) => {
//       return a;
//     },
//   },
// });

// const api = getPluginApi(createPlateEditor(), a);
//
// type PluginKey = typeof LengthPlugin | typeof ReactPlugin;
// // ... other plugins
//
// type MyEditorApi = {
//   [K in PluginKey['key']]: InferPluginApi<Extract<PluginKey, { key: K }>>;
// };
//
// type MyEditor = {
//   api: MyEditorApi;
// } & PlateEditor;
//
// // Usage
// const myEditor: MyEditor = createPlateEditor({
//   plugins: [LengthPlugin, ReactPlugin /* ... other plugins */],
// });
//
// // Now you can use it like this:
// myEditor.api.
