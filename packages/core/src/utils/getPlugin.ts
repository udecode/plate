import { PlateEditor } from '../types/PlateEditor';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePlugin/PlatePluginKey';
import { getPluginsByKey } from './getPluginsByKey';

/**
 * Get plugin options by plugin key.
 */
export const getPlugin = <P = {}, T = {}>(
  editor: PlateEditor<T>,
  key: PluginKey
): WithPlatePlugin<T, P> => getPluginsByKey<T, P>(editor)[key] ?? { key };
