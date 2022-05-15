import { NoInfer } from '../common/types/utility/NoInfer';
import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from '../types/plugins/PlatePlugin';

export const mockPlugin = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  plugin?: Partial<PlatePlugin<NoInfer<P>>>
): WithPlatePlugin<NoInfer<P>, V, E> =>
  ({
    key: '',
    type: '',
    editor: {} as any,
    inject: {} as any,
    options: {} as any,
    ...plugin,
  } as any);
