import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { AnyObject } from '../types/utility/AnyObject';
import { getPluginsByKey } from './getPluginsByKey';

/**
 * Get plugin options by plugin key.
 */
export const getPlugin = <P = AnyObject, T = {}>(
  editor: PlateEditor<T>,
  key: PluginKey
): PlatePlugin<T, P> => getPluginsByKey<T, P>(editor)[key] ?? { key };
