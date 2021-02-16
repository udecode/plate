import { SlatePlugin } from '../types/SlatePlugin';

/**
 * Get void types from the plugins
 */
export const getVoidTypes = (plugins: SlatePlugin[]): string[] => {
  return plugins.reduce((arr: string[], plugin) => {
    const types = plugin.voidTypes || [];
    return arr.concat(types);
  }, []);
};
