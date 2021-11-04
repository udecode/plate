import { WithOverride } from '../types';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { PlateEditor, TPlateEditor } from '../types/SPEditor';

/**
 * Helper to get a plate plugin returning `withOverrides`
 */
export const getPlatePluginWithOverrides = <
  T = TPlateEditor,
  V extends (...args: any) => WithOverride<T> = (
    ...args: any
  ) => WithOverride<T>
>(
  withOverrides: V
) => (...options: Parameters<V>): PlatePlugin<T> => ({
  withOverrides: withOverrides(...(options as any)),
});
