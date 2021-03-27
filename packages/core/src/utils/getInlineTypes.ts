import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * Get inline types from the plugins
 */
export const getInlineTypes = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): string[] => {
  return plugins.flatMap((p) => p.inlineTypes?.(editor) ?? []);
};
