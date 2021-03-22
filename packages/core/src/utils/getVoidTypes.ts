import { Editor } from 'slate';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';

/**
 * Get void types from the plugins
 */
export const getVoidTypes = (
  editor: Editor,
  plugins: SlatePlugin[]
): string[] => {
  return plugins.flatMap((p) => p.voidTypes?.(editor) ?? []);
};
