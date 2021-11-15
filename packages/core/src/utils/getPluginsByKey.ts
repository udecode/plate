import { PlateEditor } from '../types/PlateEditor';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePlugin/PlatePluginKey';

/**
 * Get `editor.pluginsByKey`
 */
export const getPluginsByKey = <T = {}, P = {}>(
  editor?: PlateEditor<T>
): Record<PluginKey, WithPlatePlugin<T, P>> => {
  const plugins = {};

  if (editor?.pluginsByKey) {
    return editor.pluginsByKey as Record<PluginKey, WithPlatePlugin<T, P>>;
  }

  return plugins;
};
