import { PlateEditor } from '../types/PlateEditor';
import { getPlugin } from './getPlugin';

/**
 * Get plugin type option by plugin key.
 */
export const getPluginType = <T = {}>(
  editor?: PlateEditor<T>,
  key?: string
): string => getPlugin(editor, key).type ?? key ?? '';
