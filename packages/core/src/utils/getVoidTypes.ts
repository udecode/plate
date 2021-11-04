import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';

/**
 * Get void types from the plugins
 */
export const getVoidTypes = (
  editor: PlateEditor,
  plugins: PlatePlugin[]
): string[] => {
  return plugins.flatMap((p) => p.voidTypes?.(editor) ?? []);
};
