import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * Get inline types from the plugins
 */
export const getInlineTypes = <T extends SPEditor = SPEditor>(
  editor: T,
  plugins: SlatePlugin<T>[]
): string[] => {
  return plugins.flatMap((p) => p.inlineTypes?.(editor) ?? []);
};
