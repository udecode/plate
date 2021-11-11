import { PlateEditor } from '../types/PlateEditor';
import { getPlatePluginOptions } from './getPlatePluginOptions';

/**
 * Get plugin type option by plugin key.
 */
export const getPlatePluginType = <T = {}>(
  editor?: PlateEditor<T>,
  key?: string
): string => getPlatePluginOptions(editor, key).type ?? key ?? '';
