import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { NoInfer } from '../types/utility/NoInfer';

export const mockPlugin = <P = {}>(
  plugin?: Partial<PlatePlugin<{}, NoInfer<P>>>
): WithPlatePlugin<{}, NoInfer<P>> => ({
  key: '',
  type: '',
  editor: {},
  inject: {},
  options: {} as any,
  ...plugin,
});
