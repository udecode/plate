import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * Get void types from the plugins
 */
export const getVoidTypes = (
  editor: SPEditor,
  plugins: PlatePlugin[]
): string[] => {
  return plugins.flatMap((p) => p.voidTypes?.(editor) ?? []);
};
