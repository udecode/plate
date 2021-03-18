import { Editor } from 'slate';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';

/**
 * Get inline types from the plugins
 */
export const getInlineTypes = (
  editor: Editor,
  plugins: SlatePlugin[]
): string[] => {
  return plugins.flatMap((p) => p.inlineTypes?.(editor) ?? []);
};
