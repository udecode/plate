import { Value } from '@udecode/slate';
import { PlateEditor } from '../types/PlateEditor';
import { getPlugin } from './getPlugin';

/**
 * Get plugin type option by plugin key.
 */
export const getPluginType = <V extends Value>(
  editor: PlateEditor<V>,
  key: string
): string => getPlugin<{}, V>(editor, key).type ?? key ?? '';
