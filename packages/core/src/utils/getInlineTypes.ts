import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { PlateEditor } from '../types/PlateEditor';

/**
 * Get inline types from the plugins
 */
export const getInlineTypes = <T = {}>(
  editor: PlateEditor<T>,
  plugins: PlatePlugin<T>[]
): string[] => {
  return plugins.flatMap((p) => p.inlineTypes?.(editor) ?? []);
};
