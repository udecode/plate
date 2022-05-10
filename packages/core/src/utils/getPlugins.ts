import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';

/**
 * Get `editor.plugins`
 */
export const getPlugins = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
): PlatePlugin<{}, V, E>[] => {
  return (editor?.plugins as PlatePlugin<{}, V, E>[]) ?? [];
};
