import { WithOverride } from '../types';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';

/**
 * Helper to get a plate plugin returning `withOverrides`
 */
export const getPlatePluginWithOverrides = <
  T = {},
  O = {},
  V extends (...args: any) => WithOverride<T, O> = (
    ...args: any
  ) => WithOverride<T, O>
>(
  withOverrides: V
) => (...options: Parameters<V>): PlatePlugin<T & O> => ({
  withOverrides: withOverrides(...(options as any)) as any,
});
