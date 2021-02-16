import { SlatePlugin } from '../types/SlatePlugin';

/**
 * Get inline types from the plugins
 */
export const getInlineTypes = (plugins: SlatePlugin[]): string[] => {
  return plugins.reduce((arr: string[], plugin) => {
    const types = plugin.inlineTypes || [];
    return arr.concat(types);
  }, []);
};
