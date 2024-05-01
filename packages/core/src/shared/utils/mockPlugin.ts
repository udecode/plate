import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../types/PlateEditor';
import type { NoInfer } from '../types/misc/NoInfer';
import type {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from '../types/plugin/PlatePlugin';

export const mockPlugin = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  plugin?: Partial<PlatePlugin<NoInfer<P>>>
): WithPlatePlugin<NoInfer<P>, V, E> =>
  ({
    editor: {} as any,
    inject: {} as any,
    key: '',
    options: {} as any,
    type: '',
    ...plugin,
  }) as any;
