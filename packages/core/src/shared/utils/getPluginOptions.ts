import type { PlatePlugin } from '../types';
import type { PlateEditor } from '../types/PlateEditor';
import type { PluginKey } from '../types/plugin/PlatePluginKey';

import { getPlugin } from './getPlugin';

export type InferPluginOptions<P> =
  P extends PlatePlugin<any, infer O, any, any> ? O : never;

// export function getPluginOptions<K extends string, P extends PlatePlugin<K, any, any, any>>(
//   editor: PlateEditor,
//   plugin: P
// ): InferPluginOptions<P> {
//   return (editor.pluginsByKey[plugin.key]?.options ?? {}) as InferPluginOptions<P>;
// }

export const getPluginOptions = <P>(editor: PlateEditor, key: PluginKey): P =>
  getPlugin<any, P>(editor, key).options ?? ({} as P);
