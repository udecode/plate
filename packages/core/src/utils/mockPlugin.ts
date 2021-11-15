import {
  PlatePlugin,
  WithPlatePlugin,
} from '../types/plugins/PlatePlugin/PlatePlugin';
import { NoInfer } from '../types/utility/NoInfer';

export const mockPlugin = <P = {}>(
  plugin?: Partial<PlatePlugin<{}, NoInfer<P>>>
): WithPlatePlugin<{}, NoInfer<P>> => ({
  key: '',
  type: '',
  inject: {},
  options: {} as any,
  ...plugin,
});
