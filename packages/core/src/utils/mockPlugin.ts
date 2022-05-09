import { NoInfer } from '../common/types/utility/NoInfer';
import { Value } from '../slate/editor/TEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';

export const mockPlugin = <P = {}, V extends Value = Value>(
  plugin?: Partial<PlatePlugin<V, {}, NoInfer<P>>>
): WithPlatePlugin<V, {}, NoInfer<P>> => ({
  key: '',
  type: '',
  editor: {},
  inject: {},
  options: {} as any,
  ...plugin,
});
