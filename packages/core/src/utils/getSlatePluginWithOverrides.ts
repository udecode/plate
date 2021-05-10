/**
 * Helper to get a slate plugin returning `withOverrides`
 */
import { WithOverride } from '../types';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

export const getSlatePluginWithOverrides = <
  T extends SPEditor = SPEditor,
  V extends (...args: any) => WithOverride<T> = (
    ...args: any
  ) => WithOverride<T>
>(
  withOverrides: V
) => (...options: Parameters<V>): SlatePlugin<T> => ({
  withOverrides: withOverrides(...(options as any)),
});
