import { Value } from '@udecode/slate';
import { PlateEditor } from '../types/PlateEditor';
import { PluginOptions, WithPlatePlugin } from '../types/plugin/PlatePlugin';
import { PluginKey } from '../types/plugin/PlatePluginKey';
import { getPluginsByKey } from './getPluginsByKey';

/**
 * Get plugin options by plugin key.
 */
export const getPlugin = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  key: PluginKey
): WithPlatePlugin<P, V, E> => getPluginsByKey<P, V, E>(editor)[key] ?? { key };
