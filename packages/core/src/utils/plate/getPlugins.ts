import { Value } from '@udecode/slate';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PlatePlugin, PluginOptions } from '../../types/plugin/PlatePlugin';

/**
 * Get `editor.plugins`
 */
export const getPlugins = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
): PlatePlugin<PluginOptions, V, E>[] => {
  return (editor?.plugins as PlatePlugin<PluginOptions, V, E>[]) ?? [];
};
