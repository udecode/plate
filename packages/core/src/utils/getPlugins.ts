import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';

/**
 * Get `editor.plugins`
 */
export const getPlugins = <T = {}>(
  editor?: PlateEditor<T>
): PlatePlugin<T>[] => {
  return editor?.plugins ?? [];
};
