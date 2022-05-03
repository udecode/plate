import { Value } from '../slate/types/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePluginKey';

/**
 * Get `editor.pluginsByKey`
 */
export const getPluginsByKey = <V extends Value, T = {}, P = {}>(
  editor?: PlateEditor<V, T>
): Record<PluginKey, WithPlatePlugin<V, T, P>> => {
  const plugins = {};

  if (editor?.pluginsByKey) {
    return editor.pluginsByKey as Record<PluginKey, WithPlatePlugin<V, T, P>>;
  }

  return plugins;
};
