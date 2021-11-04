import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { PlateEditor, TPlateEditor } from '../types/SPEditor';

/**
 * Get void types from the plugins
 */
export const getVoidTypes = (
  editor: PlateEditor,
  plugins: PlatePlugin[]
): string[] => {
  return plugins.flatMap((p) => p.voidTypes?.(editor) ?? []);
};
