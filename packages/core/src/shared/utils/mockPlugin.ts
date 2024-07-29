import type { NoInfer } from '../types/misc/NoInfer';
import type { PlatePlugin, PlatePlugin } from '../types/plugin/PlatePlugin';

export const mockPlugin = <O = {}, T = {}, Q = {}, S = {}>(
  plugin?: Partial<PlatePlugin<NoInfer<O>, T, Q, S>>
): PlatePlugin<NoInfer<O>, T, Q, S> =>
  ({
    editor: {} as any,
    inject: {} as any,
    key: '',
    options: {} as any,
    type: '',
    ...plugin,
  }) as any;
