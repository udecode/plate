import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { getPlugin } from './getPlugin';

/**
 * Get plugin type option by plugin key.
 */
export const getPluginType = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  key: string
): string => getPlugin(editor, key).type ?? key ?? '';
