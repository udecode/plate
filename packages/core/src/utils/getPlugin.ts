import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { getPluginsByKey } from './getPluginsByKey';

/**
 * Get plugin options by plugin key.
 */
export const getPlugin = <P = {}, V extends Value = Value, T = {}>(
  editor: PlateEditor<V, T>,
  key: PluginKey
): WithPlatePlugin<V, T, P> => getPluginsByKey<V, T, P>(editor)[key] ?? { key };
