import type { PlatePlugin } from '../types';
import type { PlateEditor } from '../types/PlateEditor';

export type InferPluginOptions<P> =
  P extends PlatePlugin<any, infer O, any, any, any> ? O : never;

export function getPluginOptions<
  P extends PlatePlugin<any, any, any, any, any>,
>(editor: PlateEditor, plugin: P): InferPluginOptions<P> {
  return (editor.pluginsByKey[plugin.key]?.options ??
    {}) as InferPluginOptions<P>;
}
