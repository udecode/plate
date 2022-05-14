import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, PluginOptions } from '../types/plugins/PlatePlugin';

/**
 * Get `editor.plugins`
 */
export const getPlugins = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
): PlatePlugin<PluginOptions, V, E>[] => {
  return (editor?.plugins as PlatePlugin<PluginOptions, V, E>[]) ?? [];
};
