import { SPEditor } from '../plugins/useSlatePluginsPlugin';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';

/**
 * Get void types from the plugins
 */
export const getVoidTypes = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): string[] => {
  return plugins.flatMap((p) => p.voidTypes?.(editor) ?? []);
};
