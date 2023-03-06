import { Value } from '@udecode/slate';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PluginOptions, WithPlatePlugin } from '../../types/plugin/PlatePlugin';
import { PluginKey } from '../../types/plugin/PlatePluginKey';

/**
 * Get `editor.pluginsByKey`
 */
export const getPluginsByKey = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor?: E
): Record<PluginKey, WithPlatePlugin<P, V, E>> => {
  return (
    (editor?.pluginsByKey as Record<PluginKey, WithPlatePlugin<P, V, E>>) ?? {}
  );
};
