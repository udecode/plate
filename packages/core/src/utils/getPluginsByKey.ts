import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePluginKey';

/**
 * Get `editor.pluginsByKey`
 */
export const getPluginsByKey = <T = {}>(
  editor?: PlateEditor<T>
): Record<PluginKey, PlatePlugin<T>> => {
  const plugins = {};

  if (editor?.pluginsByKey) {
    return editor.pluginsByKey;
  }

  return plugins;
};
