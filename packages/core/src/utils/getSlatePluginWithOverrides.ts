/**
 * Helper to get a slate plugin returning `withOverrides`
 */
import { WithOverride } from '../types';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

export const getSlatePluginWithOverrides = <T extends SPEditor = SPEditor>(
  withOverrides: (...args: any) => WithOverride<T>
) => (options?: Parameters<typeof withOverrides>[0]): SlatePlugin<T> => ({
  withOverrides: withOverrides(options),
});
