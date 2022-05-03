import { NoInfer } from '../common/types/utility/NoInfer';
import { Value } from '../slate/types/TEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';

export const mockPlugin = <V extends Value, P = {}>(
  plugin?: Partial<PlatePlugin<V, {}, NoInfer<P>>>
): WithPlatePlugin<V, {}, NoInfer<P>> => ({
  key: '',
  type: '',
  editor: {},
  inject: {},
  options: {} as any,
  ...plugin,
});
