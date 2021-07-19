import { WithOverride } from '../types';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * Helper to get a plate plugin returning `withOverrides`
 */
export const getPlatePluginWithOverrides = <
  T extends SPEditor = SPEditor,
  V extends (...args: any) => WithOverride<T> = (
    ...args: any
  ) => WithOverride<T>
>(
  withOverrides: V
) => (...options: Parameters<V>): PlatePlugin<T> => ({
  withOverrides: withOverrides(...(options as any)),
});
