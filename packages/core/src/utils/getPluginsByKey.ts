import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePluginKey';

/**
 * Get `editor.pluginsByKey`
 */
export const getPluginsByKey = <
  P = {},
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor?: E
): Record<PluginKey, WithPlatePlugin<P, V, E>> => {
  return (
    (editor?.pluginsByKey as Record<PluginKey, WithPlatePlugin<P, V, E>>) ?? {}
  );
};
