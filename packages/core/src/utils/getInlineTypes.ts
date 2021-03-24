import { SPEditor } from '../plugins/useSlatePluginsPlugin';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';

/**
 * Get inline types from the plugins
 */
export const getInlineTypes = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): string[] => {
  return plugins.flatMap((p) => p.inlineTypes?.(editor) ?? []);
};
