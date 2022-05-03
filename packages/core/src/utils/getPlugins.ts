import { Value } from '../slate/types/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';

/**
 * Get `editor.plugins`
 */
export const getPlugins = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>
): PlatePlugin<V, T>[] => {
  return editor?.plugins ?? [];
};
