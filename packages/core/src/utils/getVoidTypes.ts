import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * Get void types from the plugins
 */
export const getVoidTypes = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): string[] => {
  return plugins.flatMap((p) => p.voidTypes?.(editor) ?? []);
};
