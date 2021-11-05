import { PlateEditor } from '../types/PlateEditor';
import { getPlatePluginOptions } from './getPlatePluginOptions';

/**
 * Get plugin type option by plugin key.
 */
export const getPlatePluginType = <T = {}>(
  editor?: PlateEditor<T>,
  pluginKey?: string
): string => getPlatePluginOptions(editor, pluginKey).type ?? pluginKey ?? '';
