import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * Get inline types from the plugins
 */
export const getInlineTypes = <T extends SPEditor = SPEditor>(
  editor: T,
  plugins: PlatePlugin<T>[]
): string[] => {
  return plugins.flatMap((p) => p.inlineTypes?.(editor) ?? []);
};
