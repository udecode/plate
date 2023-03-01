import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { NoInfer } from '../../../../slate-utils/src/types/misc/NoInfer';
import { PlateEditor } from '../../types/plate/PlateEditor';
import {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from '../../types/plugin/PlatePlugin';

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
