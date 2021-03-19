/**
 * Helper to get a slate plugin returning `withOverrides`
 */
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';

export const getSlatePluginWithOverrides = <T extends (...args: any) => any>(
  withOverrides: T
) => (options?: Parameters<T>[0]): SlatePlugin => ({
  withOverrides: withOverrides(options),
});
