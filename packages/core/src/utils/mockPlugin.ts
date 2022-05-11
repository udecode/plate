import { NoInfer } from '../common/types/utility/NoInfer';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';

export const mockPlugin = <P = {}>(
  plugin?: Partial<PlatePlugin<NoInfer<P>>>
): WithPlatePlugin<NoInfer<P>> => ({
  key: '',
  type: '',
  editor: {},
  inject: {},
  options: {} as any,
  ...plugin,
});
