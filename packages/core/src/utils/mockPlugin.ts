import { NoInfer } from '../common/types/utility/NoInfer';
import {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from '../types/plugins/PlatePlugin';

export const mockPlugin = <P = PluginOptions>(
  plugin?: Partial<PlatePlugin<NoInfer<P>>>
): WithPlatePlugin<NoInfer<P>> => ({
  key: '',
  type: '',
  editor: {},
  inject: {},
  options: {} as any,
  ...plugin,
});
